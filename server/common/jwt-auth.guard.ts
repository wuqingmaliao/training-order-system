import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { verifyToken, type TokenPayload } from './auth';

export const ROLES_KEY = 'roles';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers['x-auth-token'] as string;

    if (!token) {
      throw new UnauthorizedException('请先登录');
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    req.user = payload;

    // 检查角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('权限不足');
      }
    }

    return true;
  }
}
