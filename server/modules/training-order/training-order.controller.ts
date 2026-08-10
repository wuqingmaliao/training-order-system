import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TrainingOrderService } from './training-order.service';
import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  TrainingOrderListResponse,
  TrainingOrder,
  TrainingOrderExportResponse,
} from '@shared/api.interface';

@Controller('api/training-orders')
export class TrainingOrderController {
  constructor(private readonly trainingOrderService: TrainingOrderService) {}

  @Post()
  async createOrder(
    @Body() body: CreateTrainingOrderRequest,
  ): Promise<CreateTrainingOrderResponse> {
    return this.trainingOrderService.createOrder(body);
  }

  @Get('export/all')
  async exportOrders(
    @Query('keyword') keyword?: string,
    @Query('trainingType') trainingType?: string,
    @Query('customerSource') customerSource?: string,
    @Query('contractStatus') contractStatus?: string,
  ): Promise<TrainingOrderExportResponse> {
    return this.trainingOrderService.exportOrders({
      keyword,
      trainingType,
      customerSource,
      contractStatus,
    });
  }

  @Get(':id')
  async getOrderDetail(@Param('id') id: string): Promise<TrainingOrder> {
    return this.trainingOrderService.getOrderDetail(id);
  }

  @Get()
  async getOrderList(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('keyword') keyword?: string,
    @Query('trainingType') trainingType?: string,
    @Query('customerSource') customerSource?: string,
    @Query('contractStatus') contractStatus?: string,
  ): Promise<TrainingOrderListResponse> {
    return this.trainingOrderService.getOrderList({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      keyword,
      trainingType,
      customerSource,
      contractStatus,
    });
  }
}
