import { Module } from '@nestjs/common';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

export const DB_TOKEN = 'DB_TOKEN';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'training.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    real_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

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
    user_id TEXT,
    created_by_name TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const columns = sqlite.prepare("PRAGMA table_info(training_order)").all() as { name: string }[];
const columnNames = columns.map(c => c.name);

if (!columnNames.includes('user_id')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN user_id TEXT");
}
if (!columnNames.includes('created_by_name')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN created_by_name TEXT NOT NULL DEFAULT ''");
}
if (!columnNames.includes('updated_at')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)");
}

sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_training_order_user_id ON training_order(user_id);
  CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name);
  CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone);
  CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project);
  CREATE INDEX IF NOT EXISTS idx_training_order_training_type ON training_order(training_type);
  CREATE INDEX IF NOT EXISTS idx_training_order_customer_source ON training_order(customer_source);
  CREATE INDEX IF NOT EXISTS idx_training_order_contract_status ON training_order(contract_status);
  CREATE INDEX IF NOT EXISTS idx_training_order_sign_date ON training_order(sign_date);
  CREATE INDEX IF NOT EXISTS idx_training_order_created_at ON training_order(created_at);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);

const adminExists = sqlite.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
  const adminId = crypto.randomUUID();
  const now = Date.now();
  sqlite.prepare(
    "INSERT INTO users (id, username, password_hash, real_name, role, is_active, created_at) VALUES (?, ?, ?, ?, 'admin', 1, ?)"
  ).run(adminId, 'admin', `${salt}:${hash}`, '管理员', now);
}

const db = drizzle(sqlite);

@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useValue: db,
    },
  ],
  exports: [DB_TOKEN],
})
export class SqliteDatabaseModule {}
