import { TrainingOrderService } from './training-order.service';
import type { CreateTrainingOrderRequest, CreateTrainingOrderResponse, TrainingOrderListResponse, TrainingOrder, TrainingOrderExportResponse } from '@shared/api.interface';
export declare class TrainingOrderController {
    private readonly trainingOrderService;
    constructor(trainingOrderService: TrainingOrderService);
    createOrder(body: CreateTrainingOrderRequest): Promise<CreateTrainingOrderResponse>;
    exportOrders(keyword?: string, trainingType?: string, customerSource?: string, contractStatus?: string): Promise<TrainingOrderExportResponse>;
    getOrderDetail(id: string): Promise<TrainingOrder>;
    getOrderList(page: string, pageSize: string, keyword?: string, trainingType?: string, customerSource?: string, contractStatus?: string): Promise<TrainingOrderListResponse>;
}
