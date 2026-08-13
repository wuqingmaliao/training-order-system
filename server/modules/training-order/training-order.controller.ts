import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import { TrainingOrderService } from './training-order.service';
import { JwtAuthGuard, ROLES_KEY } from '../../common/jwt-auth.guard';
import type {
  CreateTrainingOrderRequest,
  UpdateTrainingOrderRequest,
  TrainingOrder,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  CreateTrainingOrderResponse,
  TrainingOrderExportParams,
  OrderStats,
  ProjectOptionsResponse,
} from '@shared/api.interface';

@Controller('api/training-orders')
@UseGuards(JwtAuthGuard)
export class TrainingOrderController {
  constructor(private readonly trainingOrderService: TrainingOrderService) {}

  @Post()
  async create(
    @Body() body: CreateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<CreateTrainingOrderResponse> {
    return this.trainingOrderService.createOrder(body, req.user!);
  }

  @Get()
  async getList(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<TrainingOrderListResponse> {
    const params: TrainingOrderListParams = {
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      keyword: query.keyword,
      businessType: query.businessType,
      isSigned: query.isSigned,
      isPaid: query.isPaid,
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    return this.trainingOrderService.getOrderList(params, req.user!);
  }

  @Get('export/all')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  async exportAll(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<{ items: TrainingOrder[] }> {
    const params: TrainingOrderExportParams = {
      keyword: query.keyword,
      businessType: query.businessType,
      isSigned: query.isSigned,
      isPaid: query.isPaid,
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    const items = await this.trainingOrderService.exportOrders(params, req.user!);
    return { items };
  }

  @Get('export/mine')
  async exportMine(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<{ items: TrainingOrder[] }> {
    const params: TrainingOrderExportParams = {
      keyword: query.keyword,
      businessType: query.businessType,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    const items = await this.trainingOrderService.exportMyOrders(params, req.user!);
    return { items };
  }

  @Get('stats')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  async getStats(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<OrderStats> {
    return this.trainingOrderService.getStats({
      startDate: query.startDate,
      endDate: query.endDate,
      userId: query.userId,
    }, req.user!);
  }

  @Get('project-options')
  async getProjectOptions(): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.getProjectOptions();
  }

  @Put('project-options')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  async updateProjectOptions(
    @Body() body: { options: string[] },
    @Req() req: Request,
  ): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.updateProjectOptions(body.options || [], req.user!);
  }

  @Get(':id')
  async getDetail(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.getOrderDetail(id, req.user!);
  }

  @Put(':id')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.updateOrder(id, body, req.user!);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.trainingOrderService.deleteOrder(id, req.user!);
    return { success: true };
  }
}
