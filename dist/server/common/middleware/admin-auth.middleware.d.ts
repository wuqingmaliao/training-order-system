import { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
export declare function generateAdminToken(): string;
export declare function verifyAdminToken(token: string): boolean;
export declare function getAdminPassword(): string;
export declare class AdminAuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
