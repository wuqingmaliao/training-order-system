import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import * as CryptoJS from 'crypto-js';

import { getAdminPassword as resolveAdminPassword } from '../admin-password';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'training-order-secret';
const TOKEN_EXPIRE_HOURS = 24;

export function generateAdminToken(): string {
  const expiresAt = Date.now() + TOKEN_EXPIRE_HOURS * 60 * 60 * 1000;
  const payload = JSON.stringify({ expiresAt, role: 'admin' });
  const signature = CryptoJS.HmacSHA256(payload, TOKEN_SECRET).toString();
  const tokenData = `${payload}.${signature}`;
  return Buffer.from(tokenData).toString('base64');
}

export function verifyAdminToken(token: string): boolean {
  try {
    const tokenData = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, signature] = tokenData.split('.');
    if (!payloadStr || !signature) return false;

    const expectedSignature = CryptoJS.HmacSHA256(
      payloadStr,
      TOKEN_SECRET,
    ).toString();
    if (signature !== expectedSignature) return false;

    const payload = JSON.parse(payloadStr);
    if (!payload.expiresAt || payload.role !== 'admin') return false;
    if (Date.now() > payload.expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}

export function getAdminPassword(): string {
  return resolveAdminPassword();
}

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-admin-token'] as string;
    if (!token || !verifyAdminToken(token)) {
      throw new UnauthorizedException('管理员认证失败');
    }
    next();
  }
}
