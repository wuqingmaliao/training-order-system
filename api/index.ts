import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;
let initError: any = null;

async function bootstrap() {
  if (cachedServer) return cachedServer;
  if (initError) throw initError;

  try {
    const { VercelAppModule } = require('../server/vercel-app.module');

    const expressApp = express();
    const app = await NestFactory.create(VercelAppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
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
