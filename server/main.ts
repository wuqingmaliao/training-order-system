import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';
import { __express as hbsExpressEngine } from 'hbs';

import { AppModule } from './app.module';

function findClientDir(): string {
  const candidates = [
    join(process.cwd(), 'dist', 'client'),   // Render: 项目根目录/dist/client
    join(process.cwd(), 'client'),           // 本地: dist/client (从dist启动时)
    join(__dirname, '..', 'client'),         // 相对编译输出
    join(__dirname, '..', '..', 'client'),   // 备用
  ];
  for (const dir of candidates) {
    // 必须同时有 index.html 和 assets 目录，才是构建后的静态文件目录
    const hasIndex = fs.existsSync(join(dir, 'index.html'));
    const hasAssets = fs.existsSync(join(dir, 'assets'));
    if (hasIndex && hasAssets) {
      return dir;
    }
  }
  // 默认返回 dist/client
  return join(process.cwd(), 'dist', 'client');
}

function findDataDir(): string {
  const candidates = [
    join(process.cwd(), 'data'),
    join(process.cwd(), 'dist', 'data'),
    join(__dirname, '..', 'data'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return join(process.cwd(), 'data');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT || process.env.SERVER_PORT || '3000');
  const host = process.env.SERVER_HOST || '0.0.0.0';

  // 启用CORS
  app.enableCors();

  // 为所有HTML响应设置no-cache头，防止浏览器缓存旧版本
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/assets/') && !req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
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
  logger.log('接口文档: http://localhost:' + port + '/api/docs');

  const clientDir = findClientDir();
  logger.log(`静态文件目录: ${clientDir}`);

  // 服务静态资源
  // 开发阶段禁止所有缓存，确保浏览器总是获取最新版本
  app.use('/assets', express.static(join(clientDir, 'assets'), {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },
  }));
  // 其他静态文件（index.html等）不缓存，确保每次都获取最新版本
  app.use(express.static(clientDir, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  }));

  // 注册视图引擎
  app.setBaseViewsDir(clientDir);
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);
  app.disable('view cache');

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`订单填写: http://localhost:${port}`);
  logger.log(`管理后台: http://localhost:${port}/admin`);
  logger.log(`接口文档: http://localhost:${port}/api/docs`);

  // 优雅关闭：收到 Ctrl+C 或关闭窗口时，正确释放端口
  const shutdown = (signal: string) => {
    logger.log(`收到 ${signal} 信号，正在关闭服务器...`);
    app.close().then(() => {
      logger.log('服务器已关闭，端口已释放。');
      process.exit(0);
    }).catch((err) => {
      logger.error('关闭服务器时出错:', err);
      process.exit(1);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  // Windows 下关闭控制台窗口时触发
  if (process.platform === 'win32') {
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }
}

bootstrap();
