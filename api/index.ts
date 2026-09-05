import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { VercelAppModule } from '../server/vercel-app.module';

let cachedServer: any;
let initError: any = null;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>筑一教育 API 文档</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>`;

async function bootstrap() {
  if (cachedServer) return cachedServer;
  if (initError) throw initError;

  try {
    const expressApp = express();
    const app = await NestFactory.create(VercelAppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // 配置 Swagger 文档（只生成 JSON，UI 用自定义 HTML）
    const config = new DocumentBuilder()
      .setTitle('筑一教育 - 培训订单管理系统 API')
      .setDescription('培训订单管理系统后端接口文档')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'x-auth-token')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    // 提供 OpenAPI JSON
    expressApp.get('/api/docs-json', (req, res) => {
      res.json(document);
    });

    // 提供自定义 Swagger UI HTML（使用 CDN 资源，避免 Vercel 打包问题）
    expressApp.get('/api/docs', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(SWAGGER_HTML);
    });

    await app.init();

    cachedServer = expressApp;
    return expressApp;
  } catch (err) {
    initError = err;
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Internal Server Error',
      code: err?.code,
      stack: err?.stack?.substring(0, 2000),
      detail: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
      }
    });
  }
}
