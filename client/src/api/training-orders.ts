import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  TrainingOrder,
  AdminLoginRequest,
  AdminLoginResponse,
  TrainingOrderExportParams,
  TrainingOrderExportResponse,
} from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

const ADMIN_TOKEN_KEY = 'admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { 'X-Admin-Token': token } : {};
}

export async function createOrder(
  data: CreateTrainingOrderRequest,
): Promise<CreateTrainingOrderResponse> {
  try {
    const response = await axiosForBackend.post(
      '/api/training-orders',
      data,
    );
    return response.data;
  } catch (error) {
    logger.error('创建订单失败', error);
    throw error;
  }
}

export async function getOrderList(
  params: TrainingOrderListParams,
): Promise<TrainingOrderListResponse> {
  try {
    const response = await axiosForBackend.get('/api/training-orders', {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    logger.error('获取订单列表失败', error);
    throw error;
  }
}

export async function getOrderDetail(id: string): Promise<TrainingOrder> {
  try {
    const response = await axiosForBackend.get(
      `/api/training-orders/${id}`,
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (error) {
    logger.error('获取订单详情失败', error);
    throw error;
  }
}

export async function exportOrders(
  params: TrainingOrderExportParams,
): Promise<TrainingOrderExportResponse> {
  try {
    const response = await axiosForBackend.get(
      '/api/training-orders/export/all',
      { params, headers: getAuthHeaders() },
    );
    return response.data;
  } catch (error) {
    logger.error('导出订单失败', error);
    throw error;
  }
}
