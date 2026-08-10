import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
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

  const clientDir = findClientDir();
  logger.log(`静态文件目录: ${clientDir}`);

  // 服务静态资源
  app.use('/assets', express.static(join(clientDir, 'assets')));
  app.use(express.static(clientDir, {
    index: false,
  }));

  // 注册视图引擎
  app.setBaseViewsDir(clientDir);
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`订单填写: http://localhost:${port}`);
  logger.log(`管理后台: http://localhost:${port}/admin/login`);
}

bootstrap();
