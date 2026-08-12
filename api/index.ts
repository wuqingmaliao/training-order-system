import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../server/app.module';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

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
