"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
const sqlite_module_1 = require("../../database/sqlite.module");
const db_helper_1 = require("../../database/db-helper");
function generateOrderNo() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `PX${dateStr}${random}`;
}
let TrainingOrderService = class TrainingOrderService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createOrder(data, user) {
        const orderNo = generateOrderNo();
        const id = crypto.randomUUID();
        const now = new Date();
        await (0, db_helper_1.$await)(this.db
            .insert(schema_1.trainingOrder)
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
        }));
        return {
            id,
            orderNo,
            message: '订单提交成功',
        };
    }
    buildConditions(params, user) {
        const conditions = [];
        if (user && user.role === 'staff') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.trainingOrder.userId, user.userId));
        }
        else if (user && user.role === 'admin' && params.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.trainingOrder.userId, params.userId));
        }
        if (params.keyword) {
            const keywordPattern = `%${params.keyword}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.trainingOrder.studentName, keywordPattern), (0, drizzle_orm_1.like)(schema_1.trainingOrder.phone, keywordPattern), (0, drizzle_orm_1.like)(schema_1.trainingOrder.examProject, keywordPattern), (0, drizzle_orm_1.like)(schema_1.trainingOrder.orderNo, keywordPattern)));
        }
        if (params.trainingType) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.trainingOrder.trainingType, params.trainingType));
        }
        if (params.customerSource) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.trainingOrder.customerSource, params.customerSource));
        }
        if (params.contractStatus) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.trainingOrder.contractStatus, params.contractStatus));
        }
        if (params.startDate) {
            const start = new Date(params.startDate);
            conditions.push((0, drizzle_orm_1.gte)(schema_1.trainingOrder.createdAt, start));
        }
        if (params.endDate) {
            const end = new Date(params.endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push((0, drizzle_orm_1.lte)(schema_1.trainingOrder.createdAt, end));
        }
        return conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
    }
    async getOrderList(params, user) {
        const whereClause = this.buildConditions(params, user);
        const offset = (params.page - 1) * params.pageSize;
        const countResult = await (0, db_helper_1.$await)(this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.trainingOrder)
            .where(whereClause));
        const items = await (0, db_helper_1.$await)(this.db
            .select({
            id: schema_1.trainingOrder.id,
            orderNo: schema_1.trainingOrder.orderNo,
            trainingType: schema_1.trainingOrder.trainingType,
            customerSource: schema_1.trainingOrder.customerSource,
            contractStatus: schema_1.trainingOrder.contractStatus,
            studentName: schema_1.trainingOrder.studentName,
            phone: schema_1.trainingOrder.phone,
            examProject: schema_1.trainingOrder.examProject,
            classMajor: schema_1.trainingOrder.classMajor,
            actualPayment: schema_1.trainingOrder.actualPayment,
            remainingAmount: schema_1.trainingOrder.remainingAmount,
            personInCharge: schema_1.trainingOrder.personInCharge,
            signDate: schema_1.trainingOrder.signDate,
            userId: schema_1.trainingOrder.userId,
            createdByName: schema_1.trainingOrder.createdByName,
            createdAt: schema_1.trainingOrder.createdAt,
        })
            .from(schema_1.trainingOrder)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.trainingOrder.createdAt))
            .limit(params.pageSize)
            .offset(offset));
        const total = Number(countResult[0]?.count || 0);
        const listItems = items.map((item) => ({
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
    async getOrderDetail(id, user) {
        const result = await (0, db_helper_1.$await)(this.db
            .select()
            .from(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.eq)(schema_1.trainingOrder.id, id))
            .limit(1));
        if (result.length === 0) {
            throw new common_1.NotFoundException('订单不存在');
        }
        const row = result[0];
        if (user && user.role === 'staff' && row.userId !== user.userId) {
            throw new common_1.ForbiddenException('无权查看此订单');
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
    async updateOrder(id, data, user) {
        const existing = await (0, db_helper_1.$await)(this.db
            .select()
            .from(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.eq)(schema_1.trainingOrder.id, id))
            .limit(1));
        if (existing.length === 0) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (user && user.role === 'staff' && existing[0].userId !== user.userId) {
            throw new common_1.ForbiddenException('无权修改此订单');
        }
        const now = new Date();
        const updateData = { updatedAt: now };
        if (data.trainingType !== undefined)
            updateData.trainingType = data.trainingType;
        if (data.customerSource !== undefined)
            updateData.customerSource = data.customerSource;
        if (data.contractStatus !== undefined)
            updateData.contractStatus = data.contractStatus;
        if (data.studentName !== undefined)
            updateData.studentName = data.studentName;
        if (data.idCard !== undefined)
            updateData.idCard = data.idCard;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.examProject !== undefined)
            updateData.examProject = data.examProject;
        if (data.classMajor !== undefined)
            updateData.classMajor = data.classMajor;
        if (data.originalPrice !== undefined)
            updateData.originalPrice = Number(data.originalPrice);
        if (data.actualPayment !== undefined)
            updateData.actualPayment = Number(data.actualPayment);
        if (data.discountedPrice !== undefined)
            updateData.discountedPrice = Number(data.discountedPrice);
        if (data.remainingAmount !== undefined)
            updateData.remainingAmount = Number(data.remainingAmount);
        if (data.personInCharge !== undefined)
            updateData.personInCharge = data.personInCharge;
        if (data.signDate !== undefined)
            updateData.signDate = data.signDate;
        if (data.promisedStudent !== undefined)
            updateData.promisedStudent = data.promisedStudent;
        if (data.referrer !== undefined)
            updateData.referrer = data.referrer;
        await (0, db_helper_1.$await)(this.db
            .update(schema_1.trainingOrder)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.trainingOrder.id, id)));
        return this.getOrderDetail(id, user);
    }
    async deleteOrder(id, user) {
        const existing = await (0, db_helper_1.$await)(this.db
            .select()
            .from(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.eq)(schema_1.trainingOrder.id, id))
            .limit(1));
        if (existing.length === 0) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (user && user.role === 'staff' && existing[0].userId !== user.userId) {
            throw new common_1.ForbiddenException('无权删除此订单');
        }
        await (0, db_helper_1.$await)(this.db
            .delete(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.eq)(schema_1.trainingOrder.id, id)));
    }
    async exportOrders(params, user) {
        const whereClause = this.buildConditions(params, user);
        const rows = await (0, db_helper_1.$await)(this.db
            .select()
            .from(schema_1.trainingOrder)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.trainingOrder.createdAt)));
        const items = rows.map((row) => ({
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
    async getStats(params, user) {
        const whereClause = this.buildConditions(params, user);
        const totalResult = await (0, db_helper_1.$await)(this.db
            .select({
            count: (0, drizzle_orm_1.sql) `count(*)`,
            totalOriginal: (0, drizzle_orm_1.sql) `COALESCE(SUM(original_price), 0)`,
            totalPayment: (0, drizzle_orm_1.sql) `COALESCE(SUM(actual_payment), 0)`,
            totalRemaining: (0, drizzle_orm_1.sql) `COALESCE(SUM(remaining_amount), 0)`,
        })
            .from(schema_1.trainingOrder)
            .where(whereClause));
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayResult = await (0, db_helper_1.$await)(this.db
            .select({
            count: (0, drizzle_orm_1.sql) `count(*)`,
            totalPayment: (0, drizzle_orm_1.sql) `COALESCE(SUM(actual_payment), 0)`,
        })
            .from(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.and)(...(whereClause ? [whereClause] : []), (0, drizzle_orm_1.gte)(schema_1.trainingOrder.createdAt, todayStart))));
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthResult = await (0, db_helper_1.$await)(this.db
            .select({
            count: (0, drizzle_orm_1.sql) `count(*)`,
            totalPayment: (0, drizzle_orm_1.sql) `COALESCE(SUM(actual_payment), 0)`,
        })
            .from(schema_1.trainingOrder)
            .where((0, drizzle_orm_1.and)(...(whereClause ? [whereClause] : []), (0, drizzle_orm_1.gte)(schema_1.trainingOrder.createdAt, monthStart))));
        let staffStats = [];
        if (user?.role === 'admin') {
            const staffWhere = this.buildConditions(params, undefined);
            staffStats = await (0, db_helper_1.$await)(this.db
                .select({
                userId: schema_1.trainingOrder.userId,
                realName: schema_1.trainingOrder.createdByName,
                orderCount: (0, drizzle_orm_1.sql) `count(*)`,
                totalPayment: (0, drizzle_orm_1.sql) `COALESCE(SUM(actual_payment), 0)`,
            })
                .from(schema_1.trainingOrder)
                .where(staffWhere)
                .groupBy(schema_1.trainingOrder.userId, schema_1.trainingOrder.createdByName));
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
};
exports.TrainingOrderService = TrainingOrderService;
exports.TrainingOrderService = TrainingOrderService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(sqlite_module_1.DB_TOKEN)),
    tslib_1.__metadata("design:paramtypes", [Object])
], TrainingOrderService);
