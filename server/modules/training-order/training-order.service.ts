import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { and, eq, like, or, gte, lte, sql, desc, inArray, getTableColumns, type SQL } from 'drizzle-orm';
import { trainingOrder, users, systemSettings } from '../../database/schema';
import { DB_TOKEN } from '../../database/token';
import { $await } from '../../database/db-helper';
import type {
  CreateTrainingOrderRequest,
  UpdateTrainingOrderRequest,
  TrainingOrder,
  TrainingOrderListParams,
  TrainingOrderListResponse,
  TrainingOrderListItem,
  TrainingOrderExportParams,
  OrderStats,
  StaffOrderStats,
  ProjectOptionsResponse,
} from '@shared/api.interface';
import type { TokenPayload } from '../../common/auth';

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function mapOrder(o: any): TrainingOrder {
  return {
    id: o.id,
    orderNo: o.orderNo,
    businessType: o.businessType || '',
    isSigned: !!o.isSigned,
    isPaid: !!o.isPaid,
    remark: o.remark || '',
    trainingType: o.trainingType || '',
    customerSource: o.customerSource || '',
    contractStatus: o.contractStatus || '未签约',
    studentName: o.studentName,
    idCard: o.idCard || '',
    phone: o.phone || '',
    examProject: o.examProject || '',
    classMajor: o.classMajor || '',
    originalPrice: o.originalPrice ?? 0,
    actualPayment: o.actualPayment ?? 0,
    discountedPrice: o.discountedPrice ?? 0,
    remainingAmount: o.remainingAmount ?? 0,
    personInCharge: o.personInCharge || '',
    academicCoordinator: o.academicCoordinator || '',
    materialStatus: o.materialStatus || '',
    signDate: o.signDate ?? null,
    promisedStudent: o.promisedStudent || '',
    referrer: o.referrer || '',
    userId: o.userId ?? null,
    createdByName: o.createdByName || '',
    team: o.team || '',
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : new Date(o.createdAt).toISOString(),
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : new Date(o.updatedAt).toISOString(),
  };
}

function mapOrderListItem(o: any, maskPhoneNum = false): TrainingOrderListItem {
  return {
    id: o.id,
    orderNo: o.orderNo,
    businessType: o.businessType || '',
    isSigned: !!o.isSigned,
    isPaid: !!o.isPaid,
    studentName: o.studentName,
    idCard: o.idCard || '',
    phone: maskPhoneNum ? maskPhone(o.phone || '') : (o.phone || ''),
    examProject: o.examProject || '',
    classMajor: o.classMajor || '',
    actualPayment: o.actualPayment ?? 0,
    discountedPrice: o.discountedPrice ?? 0,
    remainingAmount: o.remainingAmount ?? 0,
    personInCharge: o.personInCharge || '',
    academicCoordinator: o.academicCoordinator || '',
    materialStatus: o.materialStatus || '',
    remark: o.remark || '',
    userId: o.userId ?? null,
    createdByName: o.createdByName || '',
    team: o.team || '',
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : new Date(o.createdAt).toISOString(),
  };
}

@Injectable()
export class TrainingOrderService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: any,
  ) {}

  private generateOrderNo(): string {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    return `PX${dateStr}${random}`;
  }

  // 员工创建订单
  async createOrder(data: CreateTrainingOrderRequest, currentUser: TokenPayload): Promise<{ id: string; orderNo: string; message: string }> {
    if (!data.studentName || !data.studentName.trim()) {
      throw new BadRequestException('学员姓名不能为空');
    }
    if (!data.idCard || !data.idCard.trim()) {
      throw new BadRequestException('身份证号码不能为空');
    }
    if (!data.phone || !data.phone.trim()) {
      throw new BadRequestException('手机号不能为空');
    }
    if (!data.businessType) {
      throw new BadRequestException('请选择培训/非培训/学历');
    }
    if (!data.classMajor || !data.classMajor.trim()) {
      throw new BadRequestException('班次类别不能为空');
    }
    if (data.actualPayment == null || isNaN(data.actualPayment)) {
      throw new BadRequestException('收款金额不能为空');
    }
    if (data.discountedPrice == null || isNaN(data.discountedPrice)) {
      throw new BadRequestException('折后业绩不能为空');
    }
    if (data.remainingAmount == null || isNaN(data.remainingAmount)) {
      throw new BadRequestException('尾款不能为空');
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const orderNo = this.generateOrderNo();

    await $await(
      this.db
        .insert(trainingOrder)
        .values({
          id,
          orderNo,
          businessType: data.businessType,
          isSigned: false,
          isPaid: false,
          remark: data.remark || '',
          // 旧字段显式赋值，避免线上旧表缺少 DEFAULT 约束导致 NOT NULL 违规
          trainingType: '',
          customerSource: '',
          contractStatus: '未签约',
          originalPrice: 0,
          promisedStudent: '',
          referrer: '',
          studentName: data.studentName.trim(),
          idCard: data.idCard.trim(),
          phone: data.phone.trim(),
          examProject: data.examProject || '',
          classMajor: data.classMajor.trim(),
          actualPayment: Number(data.actualPayment) || 0,
          discountedPrice: Number(data.discountedPrice) || 0,
          remainingAmount: Number(data.remainingAmount) || 0,
          personInCharge: currentUser.realName,
          academicCoordinator: '',
          materialStatus: '',
          userId: currentUser.userId,
          createdByName: currentUser.realName,
          createdAt: now,
          updatedAt: now,
        })
    );

    return { id, orderNo, message: '订单创建成功' };
  }

  private buildConditions(params: TrainingOrderListParams, currentUser: TokenPayload): (SQL | undefined)[] {
    const conditions: (SQL | undefined)[] = [];

    // 员工只能看自己的订单
    if (currentUser.role === 'staff') {
      conditions.push(eq(trainingOrder.userId, currentUser.userId));
    } else if (params.userId) {
      conditions.push(eq(trainingOrder.userId, params.userId));
    }

    if (params.keyword) {
      const kw = `%${params.keyword}%`;
      conditions.push(
        or(
          like(trainingOrder.studentName, kw),
          like(trainingOrder.phone, kw),
          like(trainingOrder.orderNo, kw),
          like(trainingOrder.idCard, kw),
          like(trainingOrder.businessType, kw),
          like(trainingOrder.examProject, kw),
          like(trainingOrder.classMajor, kw),
          like(trainingOrder.personInCharge, kw),
          like(trainingOrder.academicCoordinator, kw),
          like(trainingOrder.materialStatus, kw),
          like(trainingOrder.remark, kw),
          like(trainingOrder.createdByName, kw),
          like(users.team, kw),
          like(users.realName, kw),
        )!,
      );
    }

    if (params.businessType) {
      conditions.push(eq(trainingOrder.businessType, params.businessType));
    }

    if (params.isSigned !== undefined && params.isSigned !== '') {
      conditions.push(eq(trainingOrder.isSigned, params.isSigned === 'true'));
    }

    if (params.isPaid !== undefined && params.isPaid !== '') {
      conditions.push(eq(trainingOrder.isPaid, params.isPaid === 'true'));
    }

    if (params.startDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(trainingOrder.createdAt, start));
    }

    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(trainingOrder.createdAt, end));
    }

    return conditions;
  }

  async getOrderList(params: TrainingOrderListParams, currentUser: TokenPayload): Promise<TrainingOrderListResponse> {
    const conditions = this.buildConditions(params, currentUser);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await $await<any[]>(
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(trainingOrder)
        .leftJoin(users, eq(trainingOrder.userId, users.id))
        .where(where)
    );
    const total = Number(countResult[0]?.count || 0);

    const offset = (params.page - 1) * params.pageSize;

    const list = await $await<any[]>(
      this.db
        .select({
          id: trainingOrder.id,
          orderNo: trainingOrder.orderNo,
          businessType: trainingOrder.businessType,
          isSigned: trainingOrder.isSigned,
          isPaid: trainingOrder.isPaid,
          studentName: trainingOrder.studentName,
          idCard: trainingOrder.idCard,
          phone: trainingOrder.phone,
          examProject: trainingOrder.examProject,
          classMajor: trainingOrder.classMajor,
          actualPayment: trainingOrder.actualPayment,
          discountedPrice: trainingOrder.discountedPrice,
          remainingAmount: trainingOrder.remainingAmount,
          personInCharge: trainingOrder.personInCharge,
          academicCoordinator: trainingOrder.academicCoordinator,
          materialStatus: trainingOrder.materialStatus,
          remark: trainingOrder.remark,
          userId: trainingOrder.userId,
          createdByName: trainingOrder.createdByName,
          team: users.team,
          createdAt: trainingOrder.createdAt,
        })
        .from(trainingOrder)
        .leftJoin(users, eq(trainingOrder.userId, users.id))
        .where(where)
        .orderBy(desc(trainingOrder.createdAt))
        .limit(params.pageSize)
        .offset(offset)
    );

    const maskPhoneNum = currentUser.role === 'admin';
    return {
      items: list.map(o => mapOrderListItem(o, maskPhoneNum)),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async getOrderDetail(id: string, currentUser: TokenPayload): Promise<TrainingOrder> {
    const result = await $await<any[]>(
      this.db
        .select({
          ...getTableColumns(trainingOrder),
          team: users.team,
        })
        .from(trainingOrder)
        .leftJoin(users, eq(trainingOrder.userId, users.id))
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    if (result.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    const order = result[0];

    // 员工只能查看自己的订单
    if (currentUser.role === 'staff' && order.userId !== currentUser.userId) {
      throw new ForbiddenException('无权查看此订单');
    }

    return mapOrder(order);
  }

  // 超管可改全部字段，普通管理员只能改教务对接人和资料状态
  async updateOrder(id: string, data: UpdateTrainingOrderRequest, currentUser: TokenPayload): Promise<TrainingOrder> {
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      throw new ForbiddenException('无权修改订单');
    }

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

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (currentUser.role === 'admin') {
      // 普通管理员只能改这两个字段
      if (data.academicCoordinator !== undefined) updateData.academicCoordinator = data.academicCoordinator;
      if (data.materialStatus !== undefined) updateData.materialStatus = data.materialStatus;
    } else {
      // 超管可改全部
      if (data.studentName !== undefined) updateData.studentName = data.studentName.trim();
      if (data.idCard !== undefined) updateData.idCard = data.idCard.trim();
      if (data.phone !== undefined) updateData.phone = data.phone.trim();
      if (data.businessType !== undefined) updateData.businessType = data.businessType;
      if (data.examProject !== undefined) updateData.examProject = data.examProject;
      if (data.classMajor !== undefined) updateData.classMajor = data.classMajor.trim();
      if (data.actualPayment !== undefined) updateData.actualPayment = Number(data.actualPayment) || 0;
      if (data.discountedPrice !== undefined) updateData.discountedPrice = Number(data.discountedPrice) || 0;
      if (data.remainingAmount !== undefined) updateData.remainingAmount = Number(data.remainingAmount) || 0;
      if (data.remark !== undefined) updateData.remark = data.remark || '';
      if (data.personInCharge !== undefined) updateData.personInCharge = data.personInCharge;
      if (data.academicCoordinator !== undefined) updateData.academicCoordinator = data.academicCoordinator;
      if (data.materialStatus !== undefined) updateData.materialStatus = data.materialStatus;
      if (data.isSigned !== undefined) updateData.isSigned = data.isSigned;
      if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
      if (data.createdAt !== undefined) updateData.createdAt = new Date(data.createdAt);
    }

    await $await(
      this.db
        .update(trainingOrder)
        .set(updateData)
        .where(eq(trainingOrder.id, id))
    );

    const updated = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    return mapOrder(updated[0]);
  }

  // 只有超管可以删除订单
  async deleteOrder(id: string, currentUser: TokenPayload): Promise<void> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以删除订单');
    }

    const existing = await $await<any[]>(
      this.db
        .select({ id: trainingOrder.id })
        .from(trainingOrder)
        .where(eq(trainingOrder.id, id))
        .limit(1)
    );

    if (existing.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    await $await(
      this.db
        .delete(trainingOrder)
        .where(eq(trainingOrder.id, id))
    );
  }

  // 只有超管可以导出
  async exportOrders(params: TrainingOrderExportParams, currentUser: TokenPayload): Promise<TrainingOrder[]> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以导出订单');
    }

    const conditions = this.buildConditions(params as TrainingOrderListParams, currentUser);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .leftJoin(users, eq(trainingOrder.userId, users.id))
        .where(where)
        .orderBy(desc(trainingOrder.createdAt))
    );

    return result.map(mapOrder);
  }

  // 员工导出自己的订单
  async exportMyOrders(params: TrainingOrderExportParams, currentUser: TokenPayload): Promise<TrainingOrder[]> {
    const conditions: (SQL | undefined)[] = [eq(trainingOrder.userId, currentUser.userId)];

    if (params.keyword) {
      const kw = `%${params.keyword}%`;
      conditions.push(
        or(
          like(trainingOrder.studentName, kw),
          like(trainingOrder.phone, kw),
          like(trainingOrder.orderNo, kw),
          like(trainingOrder.idCard, kw),
          like(trainingOrder.businessType, kw),
          like(trainingOrder.examProject, kw),
          like(trainingOrder.classMajor, kw),
          like(trainingOrder.personInCharge, kw),
          like(trainingOrder.academicCoordinator, kw),
          like(trainingOrder.materialStatus, kw),
          like(trainingOrder.remark, kw),
          like(trainingOrder.createdByName, kw),
        )!,
      );
    }
    if (params.businessType) {
      conditions.push(eq(trainingOrder.businessType, params.businessType));
    }
    if (params.startDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(trainingOrder.createdAt, start));
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(trainingOrder.createdAt, end));
    }

    const where = and(...conditions);
    const result = await $await<any[]>(
      this.db
        .select()
        .from(trainingOrder)
        .where(where)
        .orderBy(desc(trainingOrder.createdAt))
    );
    return result.map(mapOrder);
  }

  // 只有超管可以看统计
  async getStats(params: { startDate?: string; endDate?: string; userId?: string }, currentUser: TokenPayload): Promise<OrderStats> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以查看统计');
    }

    const conditions: (SQL | undefined)[] = [];

    if (params.userId) {
      conditions.push(eq(trainingOrder.userId, params.userId));
    }
    if (params.startDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(trainingOrder.createdAt, start));
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(trainingOrder.createdAt, end));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const allOrders = await $await<any[]>(
      this.db
        .select({
          actualPayment: trainingOrder.actualPayment,
          discountedPrice: trainingOrder.discountedPrice,
          remainingAmount: trainingOrder.remainingAmount,
          userId: trainingOrder.userId,
          createdByName: trainingOrder.createdByName,
          createdAt: trainingOrder.createdAt,
        })
        .from(trainingOrder)
        .where(where)
    );

    const totalOrders = allOrders.length;
    const totalActualPayment = allOrders.reduce((sum, o) => sum + (Number(o.actualPayment) || 0), 0);
    const totalDiscounted = allOrders.reduce((sum, o) => sum + (Number(o.discountedPrice) || 0), 0);
    const totalRemaining = allOrders.reduce((sum, o) => sum + (Number(o.remainingAmount) || 0), 0);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart);

    // 按员工统计
    const staffMap = new Map<string, StaffOrderStats>();
    for (const o of allOrders) {
      const key = o.userId || o.createdByName;
      if (!staffMap.has(key)) {
        staffMap.set(key, {
          userId: o.userId || '',
          realName: o.createdByName || '未知',
          orderCount: 0,
          totalPayment: 0,
          totalDiscounted: 0,
        });
      }
      const s = staffMap.get(key)!;
      s.orderCount++;
      s.totalPayment += Number(o.actualPayment) || 0;
      s.totalDiscounted += Number(o.discountedPrice) || 0;
    }

    // 获取员工team信息
    const userIds = [...staffMap.values()].map(s => s.userId).filter(Boolean);
    if (userIds.length > 0) {
      const userResults = await $await<any[]>(
        this.db
          .select({ id: users.id, team: users.team, realName: users.realName })
          .from(users)
          .where(inArray(users.id, userIds))
      );
      for (const s of staffMap.values()) {
        if (s.userId) {
          const u = userResults.find((ur: any) => ur.id === s.userId);
          if (u) {
            s.team = u.team || '';
            s.realName = u.realName || s.realName;
          }
        }
      }
    }

    return {
      totalOrders,
      totalActualPayment,
      totalDiscounted,
      totalRemaining,
      todayOrders: todayOrders.length,
      todayPayment: todayOrders.reduce((sum, o) => sum + (Number(o.actualPayment) || 0), 0),
      monthOrders: monthOrders.length,
      monthPayment: monthOrders.reduce((sum, o) => sum + (Number(o.actualPayment) || 0), 0),
      staffStats: [...staffMap.values()].sort((a, b) => b.totalPayment - a.totalPayment),
    };
  }

  // 通用选项获取
  async getOptions(key: string): Promise<ProjectOptionsResponse> {
    const result = await $await<any[]>(
      this.db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1)
    );

    if (result.length === 0) {
      return { options: [] };
    }

    try {
      return { options: JSON.parse(result[0].value) };
    } catch {
      return { options: [] };
    }
  }

  async updateOptions(key: string, options: string[], currentUser: TokenPayload): Promise<ProjectOptionsResponse> {
    if (currentUser.role !== 'super_admin') {
      throw new ForbiddenException('只有超级管理员可以管理选项');
    }

    const value = JSON.stringify(options);

    const existing = await $await<any[]>(
      this.db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1)
    );

    if (existing.length === 0) {
      await $await(
        this.db
          .insert(systemSettings)
          .values({ key, value })
      );
    } else {
      await $await(
        this.db
          .update(systemSettings)
          .set({ value })
          .where(eq(systemSettings.key, key))
      );
    }

    return { options };
  }

  // 项目选项管理（保留兼容）
  async getProjectOptions(): Promise<ProjectOptionsResponse> {
    return this.getOptions('exam_project_options');
  }

  async updateProjectOptions(options: string[], currentUser: TokenPayload): Promise<ProjectOptionsResponse> {
    return this.updateOptions('exam_project_options', options, currentUser);
  }
}
