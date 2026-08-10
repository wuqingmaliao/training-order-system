import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { CreateTrainingOrderRequest, CreateTrainingOrderResponse, TrainingOrderListParams, TrainingOrderListResponse, TrainingOrder, TrainingOrderExportParams, TrainingOrderExportResponse } from '@shared/api.interface';
export declare class TrainingOrderService {
    private readonly db;
    constructor(db: BetterSQLite3Database);
    createOrder(data: CreateTrainingOrderRequest): Promise<CreateTrainingOrderResponse>;
    getOrderList(params: TrainingOrderListParams): Promise<TrainingOrderListResponse>;
    getOrderDetail(id: string): Promise<TrainingOrder>;
    exportOrders(params: TrainingOrderExportParams): Promise<TrainingOrderExportResponse>;
}
