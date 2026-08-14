import { pgTable, text, boolean, real, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  realName: text('real_name').notNull(),
  role: text('role').notNull().default('staff'),
  team: text('team').notNull().default(''),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingOrder = pgTable('training_order', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNo: text('order_no').notNull().unique(),
  // 新字段
  businessType: text('business_type').notNull().default(''),
  isSigned: boolean('is_signed').notNull().default(false),
  isPaid: boolean('is_paid').notNull().default(false),
  remark: text('remark').notNull().default(''),
  // 旧字段（保留兼容）
  trainingType: text('training_type').notNull().default(''),
  customerSource: text('customer_source').notNull().default(''),
  contractStatus: text('contract_status').notNull().default('未签约'),
  studentName: text('student_name').notNull(),
  idCard: text('id_card').notNull().default(''),
  phone: text('phone').notNull().default(''),
  examProject: text('exam_project').notNull().default(''),
  classMajor: text('class_major').notNull().default(''),
  originalPrice: real('original_price').notNull().default(0),
  actualPayment: real('actual_payment').notNull().default(0),
  discountedPrice: real('discounted_price').notNull().default(0),
  remainingAmount: real('remaining_amount').notNull().default(0),
  personInCharge: text('person_in_charge').notNull().default(''),
  academicCoordinator: text('academic_coordinator').notNull().default(''),
  materialStatus: text('material_status').notNull().default(''),
  signDate: text('sign_date'),
  promisedStudent: text('promised_student').notNull().default(''),
  referrer: text('referrer').notNull().default(''),
  userId: text('user_id').references(() => users.id),
  createdByName: text('created_by_name').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const trainingOrderTable = trainingOrder;
