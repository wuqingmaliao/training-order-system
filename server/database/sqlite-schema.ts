import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  realName: text('real_name', { length: 50 }).notNull(),
  role: text('role', { length: 20 }).notNull().default('staff'),
  team: text('team', { length: 100 }).notNull().default(''),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const trainingOrder = sqliteTable('training_order', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNo: text('order_no', { length: 32 }).notNull().unique(),
  // 新字段
  businessType: text('business_type', { length: 50 }).notNull().default(''),
  isSigned: integer('is_signed', { mode: 'boolean' }).notNull().default(false),
  isPaid: integer('is_paid', { mode: 'boolean' }).notNull().default(false),
  remark: text('remark').notNull().default(''),
  // 旧字段（保留兼容）
  trainingType: text('training_type', { length: 100 }).notNull().default(''),
  customerSource: text('customer_source', { length: 100 }).notNull().default(''),
  contractStatus: text('contract_status', { length: 50 }).notNull().default('未签约'),
  studentName: text('student_name', { length: 100 }).notNull(),
  idCard: text('id_card', { length: 20 }).notNull().default(''),
  phone: text('phone', { length: 20 }).notNull().default(''),
  examProject: text('exam_project', { length: 100 }).notNull().default(''),
  classMajor: text('class_major', { length: 100 }).notNull().default(''),
  originalPrice: real('original_price').notNull().default(0),
  actualPayment: real('actual_payment').notNull().default(0),
  discountedPrice: real('discounted_price').notNull().default(0),
  remainingAmount: real('remaining_amount').notNull().default(0),
  personInCharge: text('person_in_charge', { length: 100 }).notNull().default(''),
  signDate: text('sign_date'),
  promisedStudent: text('promised_student', { length: 100 }).notNull().default(''),
  referrer: text('referrer', { length: 100 }).notNull().default(''),
  userId: text('user_id').references(() => users.id),
  createdByName: text('created_by_name', { length: 50 }).notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const trainingOrderTable = trainingOrder;
