import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { TrainingOrderService } from './training-order.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  UpdateTrainingOrderRequest,
  TrainingOrderListResponse,
  TrainingOrder,
  TrainingOrderExportResponse,
  OrderStats,
} from '@shared/api.interface';

@Controller('api/training-orders')
export class TrainingOrderController {
  constructor(private readonly trainingOrderService: TrainingOrderService) {}

  // 创建订单（需要登录）
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() body: CreateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<CreateTrainingOrderResponse> {
    return this.trainingOrderService.createOrder(body, req.user);
  }

  // 导出订单（需要登录）
  @Get('export/all')
  @UseGuards(JwtAuthGuard)
  async exportOrders(
    @Query('keyword') keyword?: string,
    @Query('trainingType') trainingType?: string,
    @Query('customerSource') customerSource?: string,
    @Query('contractStatus') contractStatus?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request,
  ): Promise<TrainingOrderExportResponse> {
    return this.trainingOrderService.exportOrders({
      keyword,
      trainingType,
      customerSource,
      contractStatus,
      userId,
      startDate,
      endDate,
    }, req?.user);
  }

  // 统计（需要登录）
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Req() req?: Request,
  ): Promise<OrderStats> {
    return this.trainingOrderService.getStats({ startDate, endDate, userId }, req?.user);
  }

  // 获取单个订单详情（需要登录）
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderDetail(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.getOrderDetail(id, req.user);
  }

  // 更新订单（需要登录）
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() body: UpdateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.updateOrder(id, body, req.user);
  }

  // 删除订单（需要登录）
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteOrder(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.trainingOrderService.deleteOrder(id, req.user);
    return { success: true };
  }

  // 获取订单列表（需要登录）
  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrderList(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('keyword') keyword?: string,
    @Query('trainingType') trainingType?: string,
    @Query('customerSource') customerSource?: string,
    @Query('contractStatus') contractStatus?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request,
  ): Promise<TrainingOrderListResponse> {
    return this.trainingOrderService.getOrderList({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      keyword,
      trainingType,
      customerSource,
      contractStatus,
      userId,
      startDate,
      endDate,
    }, req?.user);
  }
}
