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

async function bootstrap() {
  if (cachedServer) return cachedServer;
  if (initError) throw initError;

  try {
    const expressApp = express();
    const app = await NestFactory.create(VercelAppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // 配置 Swagger 接口文档
    const config = new DocumentBuilder()
      .setTitle('筑一教育 - 培训订单管理系统 API')
      .setDescription('培训订单管理系统后端接口文档')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'x-auth-token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
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
