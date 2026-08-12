import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../server/app.module';

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log'],
  });
  await app.init();

  cachedServer = expressApp;
  return expressApp;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (err: any) {
    console.error('Server bootstrap error:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
      detail: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
      }
    });
  }
}
