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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('培训订单')
@ApiBearerAuth('x-auth-token')
@Controller('api/training-orders')
@UseGuards(JwtAuthGuard)
export class TrainingOrderController {
  constructor(private readonly trainingOrderService: TrainingOrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(
    @Body() body: CreateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<CreateTrainingOrderResponse> {
    return this.trainingOrderService.createOrder(body, req.user!);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表（支持搜索、筛选、分页）' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词（姓名/手机/身份证/项目/班次等）' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数，默认20' })
  @ApiQuery({ name: 'businessType', required: false, description: '业务类型筛选' })
  @ApiQuery({ name: 'userId', required: false, description: '按员工筛选' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
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
  @ApiOperation({ summary: '导出全部订单（超管）' })
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
  @ApiOperation({ summary: '导出我的订单（员工）' })
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
  @ApiOperation({ summary: '获取订单统计数据（超管）' })
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
  @ApiOperation({ summary: '获取项目选项列表' })
  async getProjectOptions(): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.getProjectOptions();
  }

  @Put('project-options')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  @ApiOperation({ summary: '更新项目选项（超管）' })
  async updateProjectOptions(
    @Body() body: { options: string[] },
    @Req() req: Request,
  ): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.updateProjectOptions(body.options || [], req.user!);
  }

  @Get('class-major-options')
  @ApiOperation({ summary: '获取班次选项列表' })
  async getClassMajorOptions(): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.getOptions('class_major_options');
  }

  @Put('class-major-options')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  @ApiOperation({ summary: '更新班次选项（超管）' })
  async updateClassMajorOptions(
    @Body() body: { options: string[] },
    @Req() req: Request,
  ): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.updateOptions('class_major_options', body.options || [], req.user!);
  }

  @Get('material-status-options')
  @ApiOperation({ summary: '获取资料状态选项列表' })
  async getMaterialStatusOptions(): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.getOptions('material_status_options');
  }

  @Put('material-status-options')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  @ApiOperation({ summary: '更新资料状态选项（超管）' })
  async updateMaterialStatusOptions(
    @Body() body: { options: string[] },
    @Req() req: Request,
  ): Promise<ProjectOptionsResponse> {
    return this.trainingOrderService.updateOptions('material_status_options', body.options || [], req.user!);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async getDetail(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.getOrderDetail(id, req.user!);
  }

  @Put(':id')
  @SetMetadata(ROLES_KEY, ['super_admin', 'admin'])
  @ApiOperation({ summary: '更新订单（管理员）' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTrainingOrderRequest,
    @Req() req: Request,
  ): Promise<TrainingOrder> {
    return this.trainingOrderService.updateOrder(id, body, req.user!);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['super_admin'])
  @ApiOperation({ summary: '删除订单（超管）' })
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.trainingOrderService.deleteOrder(id, req.user!);
    return { success: true };
  }
}
