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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('认证')
@Controller('api/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: '注册（预留接口）' })
  async register(): Promise<AuthResponse> {
    return this.userService.register();
  }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  async login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.userService.login(body);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码（预留接口）' })
  async resetPassword(): Promise<{ success: boolean; message: string }> {
    return this.userService.resetPassword();
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('x-auth-token')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @Body() body: ChangePasswordRequest,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    return this.userService.changePassword(body, req.user!);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('x-auth-token')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  async me(@Req() req: Request): Promise<User> {
    return req.user! as unknown as User;
  }
}

@ApiTags('用户管理')
@ApiBearerAuth('x-auth-token')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@SetMetadata(ROLES_KEY, ['super_admin'])
export class UserManageController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户列表（超管）' })
  async getUsers(@Req() req: Request): Promise<UserListResponse> {
    const items = await this.userService.getAllUsers(req.user!);
    return { items, total: items.length };
  }

  @Post()
  @ApiOperation({ summary: '创建用户（超管）' })
  async createUser(
    @Body() body: CreateUserRequest,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.createUser(body, req.user!);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '启用/禁用用户（超管）' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusRequest,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.userService.updateStaffStatus(id, body.isActive, req.user!);
    return { success: true };
  }
}

@ApiTags('员工列表')
@ApiBearerAuth('x-auth-token')
@Controller('api/staff')
@UseGuards(JwtAuthGuard)
@SetMetadata(ROLES_KEY, ['super_admin', 'admin'])
export class StaffController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取员工列表（管理员）' })
  async getStaffList(): Promise<{ items: User[]; total: number }> {
    const items = await this.userService.getStaffList();
    return { items, total: items.length };
  }
}
