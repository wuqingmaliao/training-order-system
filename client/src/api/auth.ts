import type {
  LoginRequest,
  AuthResponse,
  User,
  ChangePasswordRequest,
} from '@shared/api.interface';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): User | null {
  const userStr = sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin' || user?.role === 'super_admin';
}

export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'super_admin';
}

export function getRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['X-Auth-Token'] = token;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    removeToken();
    throw new Error('未授权，请重新登录');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `请求失败 (${response.status})`);
  }

  return response.json();
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.success && result.token) {
    setToken(result.token);
    setCurrentUser(result.user);
  }

  return result;
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function logout(): void {
  removeToken();
}
