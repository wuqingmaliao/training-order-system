import type { StaffListResponse, UpdateStaffStatusRequest } from '@shared/api.interface';
import { request } from './auth';

export async function getStaffList(): Promise<StaffListResponse> {
  return request<StaffListResponse>('/api/staff');
}

export async function updateStaffStatus(
  id: string,
  data: UpdateStaffStatusRequest,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/staff/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
