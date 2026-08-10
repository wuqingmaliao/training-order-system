"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingOrderTable = exports.trainingOrder = exports.fileAttachmentArray = exports.userProfileArray = exports.fileAttachment = exports.userProfile = exports.customTimestamptz = void 0;
exports.escapeLiteral = escapeLiteral;
/* eslint-disable */
/** auto generated, do not edit */
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.customTimestamptz = (0, pg_core_1.customType)({
    dataType(config) {
        const precision = typeof config?.precision !== 'undefined'
            ? ` (${config.precision})`
            : '';
        return `timestamptz${precision}`;
    },
    toDriver(value) {
        if (value == null)
            return value;
        if (typeof value === 'number')
            return new Date(value).toISOString();
        if (typeof value === 'string')
            return value;
        if (value instanceof Date)
            return value.toISOString();
        throw new Error('Invalid timestamp value');
    },
    fromDriver(value) {
        if (value instanceof Date)
            return value;
        return new Date(value);
    },
});
exports.userProfile = (0, pg_core_1.customType)({
    dataType() {
        return 'user_profile';
    },
    toDriver(value) {
        return (0, drizzle_orm_1.sql) `ROW(${value})::user_profile`;
    },
    fromDriver(value) {
        const [userId] = value.slice(1, -1).split(',');
        return userId.trim();
    },
});
exports.fileAttachment = (0, pg_core_1.customType)({
    dataType() {
        return 'file_attachment';
    },
    toDriver(value) {
        return (0, drizzle_orm_1.sql) `ROW(${value.bucket_id},${value.file_path})::file_attachment`;
    },
    fromDriver(value) {
        const [bucketId, filePath] = value.slice(1, -1).split(',');
        return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    },
});
function escapeLiteral(str) {
    return "'" + str.replace(/'/g, "''") + "'";
}
exports.userProfileArray = (0, pg_core_1.customType)({
    dataType() {
        return 'user_profile[]';
    },
    toDriver(value) {
        if (!value || value.length === 0) {
            return (0, drizzle_orm_1.sql) `'{}'::user_profile[]`;
        }
        const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
        return drizzle_orm_1.sql.raw(`ARRAY[${elements}]::user_profile[]`);
    },
    fromDriver(value) {
        if (!value || value === '{}')
            return [];
        const inner = value.slice(1, -1);
        const matches = inner.match(/\([^)]*\)/g) || [];
        return matches.map(m => m.slice(1, -1).split(',')[0].trim());
    },
});
exports.fileAttachmentArray = (0, pg_core_1.customType)({
    dataType() {
        return 'file_attachment[]';
    },
    toDriver(value) {
        if (!value || value.length === 0) {
            return (0, drizzle_orm_1.sql) `'{}'::file_attachment[]`;
        }
        const elements = value.map(f => `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`).join(',');
        return drizzle_orm_1.sql.raw(`ARRAY[${elements}]::file_attachment[]`);
    },
    fromDriver(value) {
        if (!value || value === '{}')
            return [];
        const inner = value.slice(1, -1);
        const matches = inner.match(/\([^)]*\)/g) || [];
        return matches.map(m => {
            const [bucketId, filePath] = m.slice(1, -1).split(',');
            return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
        });
    },
});
exports.trainingOrder = (0, pg_core_1.pgTable)("training_order", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    orderNo: (0, pg_core_1.varchar)("order_no", { length: 32 }).notNull().unique(),
    trainingType: (0, pg_core_1.varchar)("training_type", { length: 100 }).notNull(),
    customerSource: (0, pg_core_1.varchar)("customer_source", { length: 100 }).notNull(),
    contractStatus: (0, pg_core_1.varchar)("contract_status", { length: 50 }).notNull().default('pending'),
    studentName: (0, pg_core_1.varchar)("student_name", { length: 100 }).notNull(),
    idCard: (0, pg_core_1.varchar)("id_card", { length: 20 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 20 }).notNull(),
    examProject: (0, pg_core_1.varchar)("exam_project", { length: 100 }).notNull(),
    classMajor: (0, pg_core_1.varchar)("class_major", { length: 100 }).notNull(),
    originalPrice: (0, pg_core_1.numeric)("original_price").notNull().default('0'),
    actualPayment: (0, pg_core_1.numeric)("actual_payment").notNull().default('0'),
    discountedPrice: (0, pg_core_1.numeric)("discounted_price").notNull().default('0'),
    remainingAmount: (0, pg_core_1.numeric)("remaining_amount").notNull().default('0'),
    personInCharge: (0, pg_core_1.varchar)("person_in_charge", { length: 100 }).notNull(),
    signDate: (0, pg_core_1.date)("sign_date"),
    promisedStudent: (0, pg_core_1.varchar)("promised_student", { length: 100 }).notNull(),
    referrer: (0, pg_core_1.varchar)("referrer", { length: 100 }).notNull(),
    // System field: Creation time (auto-filled, do not modify)
    createdAt: (0, exports.customTimestamptz)("_created_at", { precision: 3 }).notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    // System field: Creator (auto-filled, do not modify)
    createdBy: (0, exports.userProfile)("_created_by").default((0, drizzle_orm_1.sql) `CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
    // System field: Update time (auto-filled, do not modify)
    updatedAt: (0, exports.customTimestamptz)("_updated_at", { precision: 3 }).notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    // System field: Updater (auto-filled, do not modify)
    updatedBy: (0, exports.userProfile)("_updated_by").default((0, drizzle_orm_1.sql) `CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("idx_training_order_order_no").on(table.orderNo),
    (0, pg_core_1.index)("idx_training_order_student_name").on(table.studentName),
    (0, pg_core_1.index)("idx_training_order_phone").on(table.phone),
    (0, pg_core_1.index)("idx_training_order_exam_project").on(table.examProject),
    (0, pg_core_1.index)("idx_training_order_training_type").on(table.trainingType),
    (0, pg_core_1.index)("idx_training_order_customer_source").on(table.customerSource),
    (0, pg_core_1.index)("idx_training_order_contract_status").on(table.contractStatus),
    (0, pg_core_1.index)("idx_training_order_sign_date").on(table.signDate),
]);
// table aliases
exports.trainingOrderTable = exports.trainingOrder;
