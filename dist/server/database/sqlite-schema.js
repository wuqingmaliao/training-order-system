"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingOrderTable = exports.trainingOrder = exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: (0, sqlite_core_1.text)('username', { length: 50 }).notNull().unique(),
    passwordHash: (0, sqlite_core_1.text)('password_hash').notNull(),
    realName: (0, sqlite_core_1.text)('real_name', { length: 50 }).notNull(),
    role: (0, sqlite_core_1.text)('role', { length: 20 }).notNull().default('staff'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});
exports.trainingOrder = (0, sqlite_core_1.sqliteTable)('training_order', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderNo: (0, sqlite_core_1.text)('order_no', { length: 32 }).notNull().unique(),
    trainingType: (0, sqlite_core_1.text)('training_type', { length: 100 }).notNull(),
    customerSource: (0, sqlite_core_1.text)('customer_source', { length: 100 }).notNull().default(''),
    contractStatus: (0, sqlite_core_1.text)('contract_status', { length: 50 }).notNull().default('未签约'),
    studentName: (0, sqlite_core_1.text)('student_name', { length: 100 }).notNull(),
    idCard: (0, sqlite_core_1.text)('id_card', { length: 20 }).notNull().default(''),
    phone: (0, sqlite_core_1.text)('phone', { length: 20 }).notNull().default(''),
    examProject: (0, sqlite_core_1.text)('exam_project', { length: 100 }).notNull().default(''),
    classMajor: (0, sqlite_core_1.text)('class_major', { length: 100 }).notNull().default(''),
    originalPrice: (0, sqlite_core_1.real)('original_price').notNull().default(0),
    actualPayment: (0, sqlite_core_1.real)('actual_payment').notNull().default(0),
    discountedPrice: (0, sqlite_core_1.real)('discounted_price').notNull().default(0),
    remainingAmount: (0, sqlite_core_1.real)('remaining_amount').notNull().default(0),
    personInCharge: (0, sqlite_core_1.text)('person_in_charge', { length: 100 }).notNull().default(''),
    signDate: (0, sqlite_core_1.text)('sign_date'),
    promisedStudent: (0, sqlite_core_1.text)('promised_student', { length: 100 }).notNull().default(''),
    referrer: (0, sqlite_core_1.text)('referrer', { length: 100 }).notNull().default(''),
    userId: (0, sqlite_core_1.text)('user_id').references(() => exports.users.id),
    createdByName: (0, sqlite_core_1.text)('created_by_name', { length: 50 }).notNull().default(''),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});
exports.trainingOrderTable = exports.trainingOrder;
