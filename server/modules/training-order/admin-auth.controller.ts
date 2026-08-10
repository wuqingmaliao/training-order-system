import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import {
  getAdminPassword,
  generateAdminToken,
} from '../../common/middleware/admin-auth.middleware';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from '@shared/api.interface';

@Controller('api/admin')
export class AdminAuthController {
  @Post('login')
  login(@Body() body: AdminLoginRequest): AdminLoginResponse {
    const { password } = body;
    if (password !== getAdminPassword()) {
      throw new UnauthorizedException('密码错误');
    }
    const token = generateAdminToken();
    return { success: true, token };
  }
}
