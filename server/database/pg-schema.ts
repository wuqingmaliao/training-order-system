import { pgTable, text, boolean, real, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  realName: text('real_name').notNull(),
  role: text('role').notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingOrder = pgTable('training_order', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNo: text('order_no').notNull().unique(),
  trainingType: text('training_type').notNull(),
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
  signDate: text('sign_date'),
  promisedStudent: text('promised_student').notNull().default(''),
  referrer: text('referrer').notNull().default(''),
  userId: text('user_id').references(() => users.id),
  createdByName: text('created_by_name').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingOrderTable = trainingOrder;
