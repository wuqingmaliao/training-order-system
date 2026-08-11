import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard, ROLES_KEY } from '../../common/jwt-auth.guard';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  StaffListResponse,
  UpdateStaffStatusRequest,
  User,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@shared/api.interface';

@Controller('api/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: RegisterRequest): Promise<AuthResponse> {
    return this.userService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.userService.login(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.userService.resetPassword(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<User> {
    return req.user! as unknown as User;
  }
}

@Controller('api/staff')
@UseGuards(JwtAuthGuard)
@SetMetadata(ROLES_KEY, ['admin'])
export class StaffController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getStaffList(): Promise<StaffListResponse> {
    const items = await this.userService.getStaffList();
    return { items, total: items.length };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStaffStatusRequest,
  ): Promise<{ success: boolean }> {
    await this.userService.updateStaffStatus(id, body.isActive);
    return { success: true };
  }
}
