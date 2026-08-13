// 用户相关
export type UserRole = 'super_admin' | 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  team?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  realName: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ResetPasswordRequest {
  username: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// 超管创建用户
export interface CreateUserRequest {
  username: string;
  realName: string;
  password: string;
  role: 'admin' | 'staff';
  team?: string;
}

// 登录后修改密码
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// 订单相关
export interface TrainingOrder {
  id: string;
  orderNo: string;
  // 新字段
  businessType: string;
  isSigned: boolean;
  isPaid: boolean;
  remark: string;
  // 旧字段（保留兼容）
  trainingType: string;
  customerSource: string;
  contractStatus: string;
  studentName: string;
  idCard: string;
  phone: string;
  examProject: string;
  classMajor: string;
  originalPrice: number;
  actualPayment: number;
  discountedPrice: number;
  remainingAmount: number;
  personInCharge: string;
  signDate: string | null;
  promisedStudent: string;
  referrer: string;
  userId: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingOrderListItem {
  id: string;
  orderNo: string;
  businessType: string;
  isSigned: boolean;
  isPaid: boolean;
  studentName: string;
  phone: string;
  examProject: string;
  classMajor: string;
  actualPayment: number;
  discountedPrice: number;
  remainingAmount: number;
  personInCharge: string;
  userId: string | null;
  createdByName: string;
  team?: string;
  createdAt: string;
}

export interface CreateTrainingOrderRequest {
  studentName: string;
  idCard: string;
  phone: string;
  businessType: string;
  examProject: string;
  classMajor: string;
  actualPayment: number;
  discountedPrice: number;
  remainingAmount: number;
  remark?: string;
}

export interface UpdateTrainingOrderRequest extends Partial<CreateTrainingOrderRequest> {
  isSigned?: boolean;
  isPaid?: boolean;
  personInCharge?: string;
  createdAt?: string;
}

export interface CreateTrainingOrderResponse {
  id: string;
  orderNo: string;
  message: string;
}

export interface TrainingOrderListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  businessType?: string;
  isSigned?: string;
  isPaid?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TrainingOrderListResponse {
  items: TrainingOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 旧的管理员登录（保留兼容）
export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  message?: string;
}

// 导出
export interface TrainingOrderExportParams {
  keyword?: string;
  businessType?: string;
  isSigned?: string;
  isPaid?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TrainingOrderExportResponse {
  items: TrainingOrder[];
}

// 统计
export interface StaffOrderStats {
  userId: string;
  realName: string;
  team?: string;
  orderCount: number;
  totalPayment: number;
}

export interface OrderStats {
  totalOrders: number;
  totalActualPayment: number;
  totalRemaining: number;
  todayOrders: number;
  todayPayment: number;
  monthOrders: number;
  monthPayment: number;
  staffStats: StaffOrderStats[];
}

// 用户管理
export interface UserListResponse {
  items: User[];
  total: number;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

// 项目选项管理
export interface ProjectOptionsResponse {
  options: string[];
}
