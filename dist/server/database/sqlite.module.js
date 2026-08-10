"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDatabaseModule = exports.SQLITE_DB = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const better_sqlite3_1 = tslib_1.__importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
exports.SQLITE_DB = 'SQLITE_DB';
const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'training.db');
// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const sqlite = new better_sqlite3_1.default(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
// 初始化表结构
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS training_order (
    id TEXT PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    training_type TEXT NOT NULL,
    customer_source TEXT NOT NULL DEFAULT '',
    contract_status TEXT NOT NULL DEFAULT '未签约',
    student_name TEXT NOT NULL,
    id_card TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    exam_project TEXT NOT NULL DEFAULT '',
    class_major TEXT NOT NULL DEFAULT '',
    original_price REAL NOT NULL DEFAULT 0,
    actual_payment REAL NOT NULL DEFAULT 0,
    discounted_price REAL NOT NULL DEFAULT 0,
    remaining_amount REAL NOT NULL DEFAULT 0,
    person_in_charge TEXT NOT NULL DEFAULT '',
    sign_date TEXT,
    promised_student TEXT NOT NULL DEFAULT '',
    referrer TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name);
  CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone);
  CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project);
  CREATE INDEX IF NOT EXISTS idx_training_order_training_type ON training_order(training_type);
  CREATE INDEX IF NOT EXISTS idx_training_order_customer_source ON training_order(customer_source);
  CREATE INDEX IF NOT EXISTS idx_training_order_contract_status ON training_order(contract_status);
  CREATE INDEX IF NOT EXISTS idx_training_order_sign_date ON training_order(sign_date);
`);
const db = (0, better_sqlite3_2.drizzle)(sqlite);
let SqliteDatabaseModule = class SqliteDatabaseModule {
};
exports.SqliteDatabaseModule = SqliteDatabaseModule;
exports.SqliteDatabaseModule = SqliteDatabaseModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.SQLITE_DB,
                useValue: db,
            },
        ],
        exports: [exports.SQLITE_DB],
    })
], SqliteDatabaseModule);
