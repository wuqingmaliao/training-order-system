import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

export async function adminLogin(
  data: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  try {
    const response = await axiosForBackend.post('/api/admin/login', data);
    return response.data;
  } catch (error) {
    logger.error('管理员登录失败', error);
    throw error;
  }
}
