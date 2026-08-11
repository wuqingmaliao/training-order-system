export interface User {
    id: string;
    username: string;
    realName: string;
    role: 'admin' | 'staff';
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
export interface TrainingOrder {
    id: string;
    orderNo: string;
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
    trainingType: string;
    customerSource: string;
    contractStatus: string;
    studentName: string;
    phone: string;
    examProject: string;
    classMajor: string;
    actualPayment: number;
    remainingAmount: number;
    personInCharge: string;
    signDate: string | null;
    userId: string | null;
    createdByName: string;
    createdAt: string;
}
export interface CreateTrainingOrderRequest {
    trainingType: string;
    customerSource?: string;
    contractStatus?: string;
    studentName: string;
    idCard?: string;
    phone?: string;
    examProject?: string;
    classMajor?: string;
    originalPrice?: number;
    actualPayment?: number;
    discountedPrice?: number;
    remainingAmount?: number;
    personInCharge?: string;
    signDate?: string | null;
    promisedStudent?: string;
    referrer?: string;
}
export interface UpdateTrainingOrderRequest extends Partial<CreateTrainingOrderRequest> {
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
    trainingType?: string;
    customerSource?: string;
    contractStatus?: string;
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
export interface AdminLoginRequest {
    username: string;
    password: string;
}
export interface AdminLoginResponse {
    success: boolean;
    token: string;
    message?: string;
}
export interface TrainingOrderExportParams {
    keyword?: string;
    trainingType?: string;
    customerSource?: string;
    contractStatus?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}
export interface TrainingOrderExportResponse {
    items: TrainingOrder[];
}
export interface StaffOrderStats {
    userId: string;
    realName: string;
    orderCount: number;
    totalPayment: number;
}
export interface OrderStats {
    totalOrders: number;
    totalOriginalPrice: number;
    totalActualPayment: number;
    totalRemaining: number;
    todayOrders: number;
    todayPayment: number;
    monthOrders: number;
    monthPayment: number;
    staffStats: StaffOrderStats[];
}
export interface StaffListResponse {
    items: User[];
    total: number;
}
export interface UpdateStaffStatusRequest {
    isActive: boolean;
}
