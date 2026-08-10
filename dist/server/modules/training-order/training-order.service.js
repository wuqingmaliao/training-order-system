"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingOrderService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_schema_1 = require("../../database/sqlite-schema");
const sqlite_module_1 = require("../../database/sqlite.module");
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
    async createOrder(data) {
        const orderNo = generateOrderNo();
        const id = crypto.randomUUID();
        const now = new Date();
        this.db
            .insert(sqlite_schema_1.trainingOrder)
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
    async getOrderList(params) {
        const { page, pageSize, keyword, trainingType, customerSource, contractStatus } = params;
        const conditions = [];
        if (keyword) {
            const keywordPattern = `%${keyword}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.studentName, keywordPattern), (0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.phone, keywordPattern), (0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.examProject, keywordPattern)));
        }
        if (trainingType) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.trainingType, trainingType));
        }
        if (customerSource) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.customerSource, customerSource));
        }
        if (contractStatus) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.contractStatus, contractStatus));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const offset = (page - 1) * pageSize;
        const countResult = this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(sqlite_schema_1.trainingOrder)
            .where(whereClause)
            .all();
        const items = this.db
            .select({
            id: sqlite_schema_1.trainingOrder.id,
            orderNo: sqlite_schema_1.trainingOrder.orderNo,
            trainingType: sqlite_schema_1.trainingOrder.trainingType,
            customerSource: sqlite_schema_1.trainingOrder.customerSource,
            contractStatus: sqlite_schema_1.trainingOrder.contractStatus,
            studentName: sqlite_schema_1.trainingOrder.studentName,
            phone: sqlite_schema_1.trainingOrder.phone,
            examProject: sqlite_schema_1.trainingOrder.examProject,
            classMajor: sqlite_schema_1.trainingOrder.classMajor,
            actualPayment: sqlite_schema_1.trainingOrder.actualPayment,
            personInCharge: sqlite_schema_1.trainingOrder.personInCharge,
            signDate: sqlite_schema_1.trainingOrder.signDate,
            createdAt: sqlite_schema_1.trainingOrder.createdAt,
        })
            .from(sqlite_schema_1.trainingOrder)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(sqlite_schema_1.trainingOrder.createdAt))
            .limit(pageSize)
            .offset(offset)
            .all();
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
    async getOrderDetail(id) {
        const result = this.db
            .select()
            .from(sqlite_schema_1.trainingOrder)
            .where((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.id, id))
            .limit(1)
            .all();
        if (result.length === 0) {
            throw new common_1.NotFoundException('订单不存在');
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
    async exportOrders(params) {
        const { keyword, trainingType, customerSource, contractStatus } = params;
        const conditions = [];
        if (keyword) {
            const keywordPattern = `%${keyword}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.studentName, keywordPattern), (0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.phone, keywordPattern), (0, drizzle_orm_1.like)(sqlite_schema_1.trainingOrder.examProject, keywordPattern)));
        }
        if (trainingType) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.trainingType, trainingType));
        }
        if (customerSource) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.customerSource, customerSource));
        }
        if (contractStatus) {
            conditions.push((0, drizzle_orm_1.eq)(sqlite_schema_1.trainingOrder.contractStatus, contractStatus));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const rows = this.db
            .select()
            .from(sqlite_schema_1.trainingOrder)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(sqlite_schema_1.trainingOrder.createdAt))
            .all();
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
            createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
        }));
        return { items };
    }
};
exports.TrainingOrderService = TrainingOrderService;
exports.TrainingOrderService = TrainingOrderService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(sqlite_module_1.SQLITE_DB)),
    tslib_1.__metadata("design:paramtypes", [Function])
], TrainingOrderService);
