import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and, like, or, desc, gte, lte, sql } from 'drizzle-orm';
import { trainingOrder, users } from '../../database/schema';
import { DB_TOKEN } from '../../database/token';
import { $await } from '../../database/db-helper';
import type { TokenPayload } from '../../common/auth';
import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  UpdateTrainingOrderRequest,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  TrainingOrder,
  TrainingOrderExportParams,
  TrainingOrderExportResponse,
  TrainingOrderListItem,
  OrderStats,
} from '@shared/api.interface';

function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PX${dateStr}${random}`;
}

@Injectable()
export class TrainingOrderService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: any,
  ) {}

  async createOrder(
    data: CreateTrainingOrderRequest,
    user?: TokenPayload,
  ): Promise<CreateTrainingOrderResponse> {
    const orderNo = generateOrderNo();
    const id = crypto.randomUUID();
    const now = new Date();

    await $await(
      this.db
        .insert(trainingOrder)
        .values({
          id,
          orderNo,
          trainingType: data.trainingType,
          customerSource: data.customerSource || '',
          contractStatus: data.contractStatus || '未签约',
          studentName: data.studentName,
          idCard: data.idCard || '',
          phone: data.phone || '',
          examProject: data.examProject || '',
          classMajor: data.classMajor || '',
          originalPrice: Number(data.originalPrice) || 0,
          actualPayment: Number(data.actualPayment) || 0,
          discountedPrice: Number(data.discountedPrice) || 0,
          remainingAmount: Number(data.remainingAmount) || 0,
          personInCharge: data.personInCharge || '',
          signDate: data.signDate || null,
          promisedStudent: data.promisedStudent || '',
          referrer: data.referrer || '',
          userId: user?.userId || null,
          createdByName: user?.realName || '',
          createdAt: now,
          updatedAt: now,
        })
    );

    return {
      id,
      orderNo,
      message: '订单提交成功',
    };
  }

  private buildConditions(params: {
    keyword?: string;
    trainingType?: string;
    customerSource?: string;
    contractStatus?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }, user?: TokenPayload) {
    const conditions: any[] = [];

    if (user && user.role === 'staff') {
      conditions.push(eq(trainingOrder.userId, user.userId));
    } else if (user && user.role === 'admin' && params.userId) {
      conditions.push(eq(trainingOrder.userId, params.userId));
    }

    if (params.keyword) {
      const keywordPattern = `%${params.keyword}%`;
      conditions.push(
        or(
          like(trainingOrder.studentName, keywordPattern),
          like(trainingOrder.phone, keywordPattern),
          like(trainingOrder.examProject, keywordPattern),
          like(trainingOrder.orderNo, keywordPattern),
        ),
      );
    }
    if (params.trainingType) {
      conditions.push(eq(trainingOrder.trainingType, params.trainingType));
    }
    if (params.customerSource) {
      conditions.push(eq(trainingOrder.customerSource, params.customerSource));
    }
    if (params.contractStatus) {
      conditions.push(eq(trainingOrder.contractStatus, params.contractStatus));
    }
    if (params.startDate) {
      const start = new Date(params.startDate);
      conditions.push(gte(trainingOrder.createdAt, start));
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(trainingOrder.createdAt, end));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async getOrderList(
    params: TrainingOrderListParams,
    user?: TokenPayload,
  ): Promise<TrainingOrderListResponse> {
    const whereClause = this.buildConditions(params, user);
    const offset = (params.page - 1) * params.pageSize;

    const countResult = await $await<any[]>(
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(trainingOrder)
        .where(whereClause)
    );

    const items = await $await<any[]>(
      this.db
        .select({
          id: trainingOrder.id,
          orderNo: trainingOrder.orderNo,
          trainingType: trainingOrder.trainingType,
          customerSource: trainingOrder.customerSource,
          contractStatus: trainingOrder.contractStatus,
          studentName: trainingOrder.studentName,
          phone: trainingOrder.phone,
          examProject: trainingOrder.examProject,
          classMajor: trainingOrder.classMajor,
          actualPayment: trainingOrder.actualPayment,
          remainingAmount: trainingOrder.remainingAmount,
          personInCharge: trainingOrder.personInCharge,
          signDate: trainingOrder.signDate,
          userId: trainingOrder.userId,
          createdByName: trainingOrder.createdByName,
          createdAt: trainingOrder.createdAt,
        })
        .from(trainingOrder)
        .where(whereClause)
        .orderBy(desc(trainingOrder.createdAt))
        .limit(params.pageSize)
        .offset(offset)
    );

    const total = Number(countResult[0]?.count || 0);
    const listItems: TrainingOrderListItem[] = items.map((item) => ({
      id: item.id,
      orderNo: item.orderNo,
      trainingType: item.trainingType,
      customerSource: item.customerSource,
      contractStatus: item.contractStatus,
      studentName: item.studentName,
      phone: item.phone,
      examProject: item.examProject,
      classMajor: item.classMajor,
      actualPayment: Number(item.actualPayment),
      remainingAmount: Number(item.remainingAmount),
      personInCharge: item.personInCharge,
      signDate: item.signDate ? String(item.signDate) : null,
      userId: item.userId,
      createdByName: item.createdByName || '',
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date(item.createdAt).toISOString(),
    }));

    return {
      items: listItems,
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async getOrderDetail(id: string, user?: TokenPayload): Promise<TrainingOrder> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    if (result.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    const row = result[0];

    if (user && user.role === 'staff' && row.userId !== user.userId) {
      throw new ForbiddenException('无权查看此订单');
    }

    return {
      id: row.id,
      orderNo: row.orderNo,
      trainingType: row.trainingType,
      customerSource: row.customerSource,
      contractStatus: row.contractStatus,
      studentName: row.studentName,
      idCard: row.idCard,
      phone: row.phone,
      examProject: row.examProject,
      classMajor: row.classMajor,
      originalPrice: Number(row.originalPrice),
      actualPayment: Number(row.actualPayment),
      discountedPrice: Number(row.discountedPrice),
      remainingAmount: Number(row.remainingAmount),
      personInCharge: row.personInCharge,
      signDate: row.signDate ? String(row.signDate) : null,
      promisedStudent: row.promisedStudent,
      referrer: row.referrer,
      userId: row.userId,
      createdByName: row.createdByName || '',
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : new Date(row.updatedAt).toISOString(),
    };
  }

  async updateOrder(
    id: string,
    data: UpdateTrainingOrderRequest,
    user?: TokenPayload,
  ): Promise<TrainingOrder> {
    const existing = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    if (existing.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    if (user && user.role === 'staff' && existing[0].userId !== user.userId) {
      throw new ForbiddenException('无权修改此订单');
    }

    const now = new Date();
    const updateData: any = { updatedAt: now };

    if (data.trainingType !== undefined) updateData.trainingType = data.trainingType;
    if (data.customerSource !== undefined) updateData.customerSource = data.customerSource;
    if (data.contractStatus !== undefined) updateData.contractStatus = data.contractStatus;
    if (data.studentName !== undefined) updateData.studentName = data.studentName;
    if (data.idCard !== undefined) updateData.idCard = data.idCard;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.examProject !== undefined) updateData.examProject = data.examProject;
    if (data.classMajor !== undefined) updateData.classMajor = data.classMajor;
    if (data.originalPrice !== undefined) updateData.originalPrice = Number(data.originalPrice);
    if (data.actualPayment !== undefined) updateData.actualPayment = Number(data.actualPayment);
    if (data.discountedPrice !== undefined) updateData.discountedPrice = Number(data.discountedPrice);
    if (data.remainingAmount !== undefined) updateData.remainingAmount = Number(data.remainingAmount);
    if (data.personInCharge !== undefined) updateData.personInCharge = data.personInCharge;
    if (data.signDate !== undefined) updateData.signDate = data.signDate;
    if (data.promisedStudent !== undefined) updateData.promisedStudent = data.promisedStudent;
    if (data.referrer !== undefined) updateData.referrer = data.referrer;

    await $await(
      this.db
        .update(trainingOrder)
        .set(updateData)
        .where(eq(trainingOrder.id, id))
    );

    return this.getOrderDetail(id, user);
  }

  async deleteOrder(id: string, user?: TokenPayload): Promise<void> {
    const existing = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    if (existing.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    if (user && user.role === 'staff' && existing[0].userId !== user.userId) {
      throw new ForbiddenException('无权删除此订单');
    }

    await $await(
      this.db
        .delete(trainingOrder)
        .where(eq(trainingOrder.id, id))
    );
  }

  async exportOrders(
    params: TrainingOrderExportParams,
    user?: TokenPayload,
  ): Promise<TrainingOrderExportResponse> {
    const whereClause = this.buildConditions(params, user);

    const rows = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(whereClause)
        .orderBy(desc(trainingOrder.createdAt))
    );

    const items: TrainingOrder[] = rows.map((row) => ({
      id: row.id,
      orderNo: row.orderNo,
      trainingType: row.trainingType,
      customerSource: row.customerSource,
      contractStatus: row.contractStatus,
      studentName: row.studentName,
      idCard: row.idCard,
      phone: row.phone,
      examProject: row.examProject,
      classMajor: row.classMajor,
      originalPrice: Number(row.originalPrice),
      actualPayment: Number(row.actualPayment),
      discountedPrice: Number(row.discountedPrice),
      remainingAmount: Number(row.remainingAmount),
      personInCharge: row.personInCharge,
      signDate: row.signDate ? String(row.signDate) : null,
      promisedStudent: row.promisedStudent,
      referrer: row.referrer,
      userId: row.userId,
      createdByName: row.createdByName || '',
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : new Date(row.updatedAt).toISOString(),
    }));

    return { items };
  }

  async getStats(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }, user?: TokenPayload): Promise<OrderStats> {
    const whereClause = this.buildConditions(params, user);

    const totalResult = await $await<any[]>(
      this.db
        .select({
          count: sql<number>`count(*)`,
          totalOriginal: sql<number>`COALESCE(SUM(original_price), 0)`,
          totalPayment: sql<number>`COALESCE(SUM(actual_payment), 0)`,
          totalRemaining: sql<number>`COALESCE(SUM(remaining_amount), 0)`,
        })
        .from(trainingOrder)
        .where(whereClause)
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayResult = await $await<any[]>(
      this.db
        .select({
          count: sql<number>`count(*)`,
          totalPayment: sql<number>`COALESCE(SUM(actual_payment), 0)`,
        })
        .from(trainingOrder)
        .where(and(
          ...(whereClause ? [whereClause] : []),
          gte(trainingOrder.createdAt, todayStart),
        ))
    );

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthResult = await $await<any[]>(
      this.db
        .select({
          count: sql<number>`count(*)`,
          totalPayment: sql<number>`COALESCE(SUM(actual_payment), 0)`,
        })
        .from(trainingOrder)
        .where(and(
          ...(whereClause ? [whereClause] : []),
          gte(trainingOrder.createdAt, monthStart),
        ))
    );

    let staffStats: any[] = [];
    if (user?.role === 'admin') {
      const staffWhere = this.buildConditions(params, undefined);
      staffStats = await $await<any[]>(
        this.db
          .select({
            userId: trainingOrder.userId,
            realName: trainingOrder.createdByName,
            orderCount: sql<number>`count(*)`,
            totalPayment: sql<number>`COALESCE(SUM(actual_payment), 0)`,
          })
          .from(trainingOrder)
          .where(staffWhere)
          .groupBy(trainingOrder.userId, trainingOrder.createdByName)
      );
    }

    return {
      totalOrders: Number(totalResult[0]?.count || 0),
      totalOriginalPrice: Number(totalResult[0]?.totalOriginal || 0),
      totalActualPayment: Number(totalResult[0]?.totalPayment || 0),
      totalRemaining: Number(totalResult[0]?.totalRemaining || 0),
      todayOrders: Number(todayResult[0]?.count || 0),
      todayPayment: Number(todayResult[0]?.totalPayment || 0),
      monthOrders: Number(monthResult[0]?.count || 0),
      monthPayment: Number(monthResult[0]?.totalPayment || 0),
      staffStats: staffStats.map(s => ({
        userId: s.userId || '',
        realName: s.realName || '未知',
        orderCount: Number(s.orderCount),
        totalPayment: Number(s.totalPayment),
      })),
    };
  }
}
