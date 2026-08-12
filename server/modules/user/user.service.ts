import { Inject, Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';
import { DB_TOKEN } from '../../database/token';
import { $await } from '../../database/db-helper';
import { hashPassword, verifyPassword, generateToken } from '../../common/auth';
import type { RegisterRequest, LoginRequest, AuthResponse, User, ResetPasswordRequest } from '@shared/api.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: any,
  ) {}

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existing = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
    );

    if (existing.length > 0) {
      throw new ConflictException('用户名已存在');
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
          role: 'staff',
          isActive: true,
          createdAt: now,
        })
    );

    const user: User = {
      id,
      username: data.username,
      realName: data.realName,
      role: 'staff',
      isActive: true,
      createdAt: now.toISOString(),
    };

    const token = generateToken({
      userId: id,
      username: data.username,
      realName: data.realName,
      role: 'staff',
    });

    return { success: true, token, user };
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

    const token = generateToken({
      userId: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role as 'admin' | 'staff',
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role as 'admin' | 'staff',
        isActive: !!user.isActive,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
      },
    };
  }

  async getStaffList(): Promise<User[]> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.role, 'staff'))
    );

    return result.map(u => ({
      id: u.id,
      username: u.username,
      realName: u.realName,
      role: u.role as 'admin' | 'staff',
      isActive: !!u.isActive,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : new Date(u.createdAt).toISOString(),
    }));
  }

  async updateStaffStatus(id: string, isActive: boolean): Promise<void> {
    const existing = await $await<any[]>(
      this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
    );

    if (existing.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    await $await(
      this.db
        .update(users)
        .set({ isActive })
        .where(eq(users.id, id))
    );
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
    );

    if (result.length === 0) {
      throw new NotFoundException('该账号未注册，请检查账号是否正确');
    }

    const user = result[0];

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    const passwordHash = hashPassword(data.newPassword);

    await $await(
      this.db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id))
    );

    return { success: true, message: '密码重置成功，请使用新密码登录' };
  }
}
