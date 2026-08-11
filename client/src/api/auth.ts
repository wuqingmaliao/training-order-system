import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@shared/api.interface';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// 使用 sessionStorage 替代 localStorage
// 原因：豆包/妙搭 webview 环境在页面导航后会清除 localStorage，但 sessionStorage 保留
const storage = window.sessionStorage;

export function getToken(): string | null {
  return storage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  storage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

export function getCurrentUser(): User | null {
  const userStr = storage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user: User): void {
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'X-Auth-Token': token } : {};
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `请求失败 (${response.status})`);
    (error as any).response = { status: response.status, data };
    throw error;
  }

  return data as T;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result.success && result.token && result.user) {
    setToken(result.token);
    setCurrentUser(result.user);
  }
  return result;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result.success && result.token && result.user) {
    setToken(result.token);
    setCurrentUser(result.user);
  }
  return result;
}

export function logout(): void {
  clearToken();
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return request<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
