import type { AdminLoginRequest, AdminLoginResponse } from '@shared/api.interface';
export declare class AdminAuthController {
    login(body: AdminLoginRequest): AdminLoginResponse;
}
