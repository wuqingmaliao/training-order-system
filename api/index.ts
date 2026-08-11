import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  // 后端已通过 nest build 编译到 dist/server/
  const { AppModule } = require('../dist/server/app.module');

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });
  await app.init();

  cachedServer = expressApp;
  return expressApp;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
