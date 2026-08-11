import type { Request } from 'express';
import { TrainingOrderService } from './training-order.service';
import type { CreateTrainingOrderRequest, CreateTrainingOrderResponse, UpdateTrainingOrderRequest, TrainingOrderListResponse, TrainingOrder, TrainingOrderExportResponse, OrderStats } from '@shared/api.interface';
export declare class TrainingOrderController {
    private readonly trainingOrderService;
    constructor(trainingOrderService: TrainingOrderService);
    createOrder(body: CreateTrainingOrderRequest, req: Request): Promise<CreateTrainingOrderResponse>;
    exportOrders(keyword?: string, trainingType?: string, customerSource?: string, contractStatus?: string, userId?: string, startDate?: string, endDate?: string, req?: Request): Promise<TrainingOrderExportResponse>;
    getStats(startDate?: string, endDate?: string, userId?: string, req?: Request): Promise<OrderStats>;
    getOrderDetail(id: string, req: Request): Promise<TrainingOrder>;
    updateOrder(id: string, body: UpdateTrainingOrderRequest, req: Request): Promise<TrainingOrder>;
    deleteOrder(id: string, req: Request): Promise<{
        success: boolean;
    }>;
    getOrderList(page: string, pageSize: string, keyword?: string, trainingType?: string, customerSource?: string, contractStatus?: string, userId?: string, startDate?: string, endDate?: string, req?: Request): Promise<TrainingOrderListResponse>;
}
