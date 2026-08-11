import type { TokenPayload } from '../../common/auth';
import type { CreateTrainingOrderRequest, CreateTrainingOrderResponse, UpdateTrainingOrderRequest, TrainingOrderListParams, TrainingOrderListResponse, TrainingOrder, TrainingOrderExportParams, TrainingOrderExportResponse, OrderStats } from '@shared/api.interface';
export declare class TrainingOrderService {
    private readonly db;
    constructor(db: any);
    createOrder(data: CreateTrainingOrderRequest, user?: TokenPayload): Promise<CreateTrainingOrderResponse>;
    private buildConditions;
    getOrderList(params: TrainingOrderListParams, user?: TokenPayload): Promise<TrainingOrderListResponse>;
    getOrderDetail(id: string, user?: TokenPayload): Promise<TrainingOrder>;
    updateOrder(id: string, data: UpdateTrainingOrderRequest, user?: TokenPayload): Promise<TrainingOrder>;
    deleteOrder(id: string, user?: TokenPayload): Promise<void>;
    exportOrders(params: TrainingOrderExportParams, user?: TokenPayload): Promise<TrainingOrderExportResponse>;
    getStats(params: {
        startDate?: string;
        endDate?: string;
        userId?: string;
    }, user?: TokenPayload): Promise<OrderStats>;
}
