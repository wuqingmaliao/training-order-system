import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, like, or, desc, count, sql } from 'drizzle-orm';
import { trainingOrder } from '../../database/sqlite-schema';
import { SQLITE_DB } from '../../database/sqlite.module';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type {
  CreateTrainingOrderRequest,
  CreateTrainingOrderResponse,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  TrainingOrder,
  TrainingOrderExportParams,
  TrainingOrderExportResponse,
  TrainingOrderListItem,
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
    @Inject(SQLITE_DB) private readonly db: BetterSQLite3Database,
  ) {}

  async createOrder(
    data: CreateTrainingOrderRequest,
  ): Promise<CreateTrainingOrderResponse> {
    const orderNo = generateOrderNo();
    const id = crypto.randomUUID();
    const now = new Date();

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
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return {
      id,
      orderNo,
      message: '订单提交成功',
    };
  }

  async getOrderList(
    params: TrainingOrderListParams,
  ): Promise<TrainingOrderListResponse> {
    const { page, pageSize, keyword, trainingType, customerSource, contractStatus } = params;
    const conditions = [];

    if (keyword) {
      const keywordPattern = `%${keyword}%`;
      conditions.push(
        or(
          like(trainingOrder.studentName, keywordPattern),
          like(trainingOrder.phone, keywordPattern),
          like(trainingOrder.examProject, keywordPattern),
        ),
      );
    }
    if (trainingType) {
      conditions.push(eq(trainingOrder.trainingType, trainingType));
    }
    if (customerSource) {
      conditions.push(eq(trainingOrder.customerSource, customerSource));
    }
    if (contractStatus) {
      conditions.push(eq(trainingOrder.contractStatus, contractStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    const countResult = this.db
      .select({ count: count() })
      .from(trainingOrder)
      .where(whereClause)
      .all();

    const items = this.db
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
        personInCharge: trainingOrder.personInCharge,
        signDate: trainingOrder.signDate,
        createdAt: trainingOrder.createdAt,
      })
      .from(trainingOrder)
      .where(whereClause)
      .orderBy(desc(trainingOrder.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

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
      personInCharge: item.personInCharge,
      signDate: item.signDate ? String(item.signDate) : null,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date(item.createdAt).toISOString(),
    }));

    return {
      items: listItems,
      total,
      page,
      pageSize,
    };
  }

  async getOrderDetail(id: string): Promise<TrainingOrder> {
    const result = this.db
      .select()
      .from(trainingOrder)
      .where(eq(trainingOrder.id, id))
      .limit(1)
      .all();

    if (result.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    const row = result[0];
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
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
    };
  }

  async exportOrders(
    params: TrainingOrderExportParams,
  ): Promise<TrainingOrderExportResponse> {
    const { keyword, trainingType, customerSource, contractStatus } = params;
    const conditions = [];

    if (keyword) {
      const keywordPattern = `%${keyword}%`;
      conditions.push(
        or(
          like(trainingOrder.studentName, keywordPattern),
          like(trainingOrder.phone, keywordPattern),
          like(trainingOrder.examProject, keywordPattern),
        ),
      );
    }
    if (trainingType) {
      conditions.push(eq(trainingOrder.trainingType, trainingType));
    }
    if (customerSource) {
      conditions.push(eq(trainingOrder.customerSource, customerSource));
    }
    if (contractStatus) {
      conditions.push(eq(trainingOrder.contractStatus, contractStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = this.db
      .select()
      .from(trainingOrder)
      .where(whereClause)
      .orderBy(desc(trainingOrder.createdAt))
      .all();

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
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
    }));

    return { items };
  }
}
