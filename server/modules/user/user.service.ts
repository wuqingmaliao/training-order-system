import { Inject, Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';
import { DB_TOKEN } from '../../database/token';
import { $await } from '../../database/db-helper';
import { hashPassword, verifyPassword, generateToken } from '../../common/auth';
import type {
  LoginRequest, AuthResponse, User, ResetPasswordRequest,
  CreateUserRequest, ChangePasswordRequest,
} from '@shared/api.interface';
import type { TokenPayload } from '../../common/auth';

function mapUser(u: any): User {
  return {
    id: u.id,
    username: u.username,
    realName: u.realName,
    role: u.role as User['role'],
    team: u.team || '',
    isActive: !!u.isActive,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : new Date(u.createdAt).toISOString(),
  };
}

@Injectable()
export class UserService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: any,
  ) {}

  // 公开注册已禁用，保留方法但直接抛错
  async register(): Promise<AuthResponse> {
    throw new ForbiddenException('公开注册已关闭，请联系超级管理员创建账号');
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
    );

    if (result.length === 0) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const user = result[0];

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    if (!verifyPassword(data.password, user.passwordHash)) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const role = user.role as 'super_admin' | 'admin' | 'staff';
    const token = generateToken({
      userId: user.id,
      username: user.username,
      realName: user.realName,
      role,
      team: user.team || '',
    });

    return {
      success: true,
      token,
      user: mapUser(user),
    };
  }

  // 超管创建用户（员工或普通管理员）
  async createUser(data: CreateUserRequest, currentUser: TokenPayload): Promise<User> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以创建用户');
    }

    const existing = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
    );

    if (existing.length > 0) {
      throw new ConflictException('账号已存在');
    }

    if (!data.password || data.password.length < 4) {
      throw new BadRequestException('密码至少4位');
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const passwordHash = hashPassword(data.password);

    await $await(
      this.db
        .insert(users)
        .values({
          id,
          username: data.username,
          passwordHash,
          realName: data.realName,
          role: data.role,
          team: data.team || '',
          isActive: true,
          createdAt: now,
        })
    );

    return {
      id,
      username: data.username,
      realName: data.realName,
      role: data.role,
      team: data.team || '',
      isActive: true,
      createdAt: now.toISOString(),
    };
  }

  // 获取所有用户（超管）
  async getAllUsers(currentUser: TokenPayload): Promise<User[]> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('权限不足');
    }

    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .orderBy(users.createdAt)
    );

    return result.map(mapUser);
  }

  // 获取员工列表（超管和普通管理员都可以，用于筛选订单）
  async getStaffList(): Promise<User[]> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.role, 'staff'))
    );

    return result.map(mapUser);
  }

  async updateStaffStatus(id: string, isActive: boolean, currentUser: TokenPayload): Promise<void> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以修改用户状态');
    }

    const existing = await $await<any[]>(
      this.db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
    );

    if (existing.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    // 不能禁用超管
    if (existing[0].role === 'super_admin') {
      throw new ForbiddenException('不能禁用超级管理员');
    }

    await $await(
      this.db
        .update(users)
        .set({ isActive })
        .where(eq(users.id, id))
    );
  }

  // 登录后修改密码
  async changePassword(data: ChangePasswordRequest, currentUser: TokenPayload): Promise<{ success: boolean; message: string }> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.id, currentUser.userId))
    );

    if (result.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const user = result[0];

    if (!verifyPassword(data.oldPassword, user.passwordHash)) {
      throw new BadRequestException('原密码错误');
    }

    if (!data.newPassword || data.newPassword.length < 4) {
      throw new BadRequestException('新密码至少4位');
    }

    const passwordHash = hashPassword(data.newPassword);

    await $await(
      this.db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, currentUser.userId))
    );

    return { success: true, message: '密码修改成功' };
  }

  // 忘记密码已禁用
  async resetPassword(): Promise<{ success: boolean; message: string }> {
    throw new ForbiddenException('自助重置密码已关闭，请联系超级管理员');
  }
}
