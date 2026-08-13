import type {
  UserListResponse,
  UpdateUserStatusRequest,
  CreateUserRequest,
  User,
} from '@shared/api.interface';
import { request } from './auth';

// 获取所有用户（超管）
export async function getUserList(): Promise<UserListResponse> {
  return request<UserListResponse>('/api/users');
}

// 创建用户（超管）
export async function createUser(data: CreateUserRequest): Promise<User> {
  return request<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 更新用户状态（超管）
export async function updateUserStatus(
  id: string,
  data: UpdateUserStatusRequest,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// 获取员工列表（超管和普通管理员，用于筛选）
export async function getStaffList(): Promise<{ items: User[]; total: number }> {
  return request<{ items: User[]; total: number }>('/api/staff');
}
