import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const trainingOrder = sqliteTable('training_order', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNo: text('order_no', { length: 32 }).notNull().unique(),
  trainingType: text('training_type', { length: 100 }).notNull(),
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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const trainingOrderTable = trainingOrder;
