import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  UpdateTrainingOrderRequest,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  TrainingOrder,
  TrainingOrderExportParams,
  OrderStats,
  ProjectOptionsResponse,
} from '@shared/api.interface';
import { request } from './auth';

function buildQuery(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function createOrder(
  data: CreateTrainingOrderRequest,
): Promise<CreateTrainingOrderResponse> {
  return request<CreateTrainingOrderResponse>('/api/training-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrderList(
  params: TrainingOrderListParams,
): Promise<TrainingOrderListResponse> {
  return request<TrainingOrderListResponse>(`/api/training-orders${buildQuery(params)}`);
}

export async function getOrderDetail(id: string): Promise<TrainingOrder> {
  return request<TrainingOrder>(`/api/training-orders/${id}`);
}

export async function updateOrder(
  id: string,
  data: UpdateTrainingOrderRequest,
): Promise<TrainingOrder> {
  return request<TrainingOrder>(`/api/training-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await request(`/api/training-orders/${id}`, { method: 'DELETE' });
}

export async function exportOrders(
  params: TrainingOrderExportParams,
): Promise<{ items: TrainingOrder[] }> {
  return request<{ items: TrainingOrder[] }>(`/api/training-orders/export/all${buildQuery(params)}`);
}

export async function exportMyOrders(
  params: Partial<TrainingOrderExportParams>,
): Promise<{ items: TrainingOrder[] }> {
  return request<{ items: TrainingOrder[] }>(`/api/training-orders/export/mine${buildQuery(params)}`);
}

export async function getStats(params?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<OrderStats> {
  return request<OrderStats>(`/api/training-orders/stats${params ? buildQuery(params) : ''}`);
}

export async function getProjectOptions(): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/project-options');
}

export async function updateProjectOptions(options: string[]): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/project-options', {
    method: 'PUT',
    body: JSON.stringify({ options }),
  });
}

export async function getClassMajorOptions(): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/class-major-options');
}

export async function updateClassMajorOptions(options: string[]): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/class-major-options', {
    method: 'PUT',
    body: JSON.stringify({ options }),
  });
}

export async function getMaterialStatusOptions(): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/material-status-options');
}

export async function updateMaterialStatusOptions(options: string[]): Promise<ProjectOptionsResponse> {
  return request<ProjectOptionsResponse>('/api/training-orders/material-status-options', {
    method: 'PUT',
    body: JSON.stringify({ options }),
  });
}
