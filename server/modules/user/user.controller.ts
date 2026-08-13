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
  LoginRequest,
  AuthResponse,
  UserListResponse,
  UpdateUserStatusRequest,
  User,
  CreateUserRequest,
  ChangePasswordRequest,
} from '@shared/api.interface';

@Controller('api/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(): Promise<AuthResponse> {
    return this.userService.register();
  }

  @Post('login')
  async login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.userService.login(body);
  }

  @Post('reset-password')
  async resetPassword(): Promise<{ success: boolean; message: string }> {
    return this.userService.resetPassword();
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: ChangePasswordRequest,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    return this.userService.changePassword(body, req.user!);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<User> {
    return req.user! as unknown as User;
  }
}

// 超管管理用户
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@SetMetadata(ROLES_KEY, ['super_admin'])
export class UserManageController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Req() req: Request): Promise<UserListResponse> {
    const items = await this.userService.getAllUsers(req.user!);
    return { items, total: items.length };
  }

  @Post()
  async createUser(
    @Body() body: CreateUserRequest,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.createUser(body, req.user!);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusRequest,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.userService.updateStaffStatus(id, body.isActive, req.user!);
    return { success: true };
  }
}

// 员工列表（超管和普通管理员都可访问，用于订单筛选）
@Controller('api/staff')
@UseGuards(JwtAuthGuard)
@SetMetadata(ROLES_KEY, ['super_admin', 'admin'])
export class StaffController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getStaffList(): Promise<{ items: User[]; total: number }> {
    const items = await this.userService.getStaffList();
    return { items, total: items.length };
  }
}
