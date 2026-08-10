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
    createdAt: string;
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
    personInCharge: string;
    signDate: string | null;
    createdAt: string;
}
export interface CreateTrainingOrderRequest {
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
}
export interface TrainingOrderListResponse {
    items: TrainingOrderListItem[];
    total: number;
    page: number;
    pageSize: number;
}
export interface AdminLoginRequest {
    password: string;
}
export interface AdminLoginResponse {
    success: boolean;
    token: string;
}
export interface TrainingOrderExportParams {
    keyword?: string;
    trainingType?: string;
    customerSource?: string;
    contractStatus?: string;
}
export interface TrainingOrderExportResponse {
    items: TrainingOrder[];
}
