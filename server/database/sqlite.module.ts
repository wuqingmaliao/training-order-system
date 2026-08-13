import { Module, Global } from '@nestjs/common';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

import { DB_TOKEN } from './token';

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
    team TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS training_order (
    id TEXT PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    business_type TEXT NOT NULL DEFAULT '',
    is_signed INTEGER NOT NULL DEFAULT 0,
    is_paid INTEGER NOT NULL DEFAULT 0,
    remark TEXT NOT NULL DEFAULT '',
    training_type TEXT NOT NULL DEFAULT '',
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

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// 迁移：为旧表添加新列
const orderColumns = sqlite.prepare("PRAGMA table_info(training_order)").all() as { name: string }[];
const orderColNames = orderColumns.map(c => c.name);

if (!orderColNames.includes('business_type')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN business_type TEXT NOT NULL DEFAULT ''");
}
if (!orderColNames.includes('is_signed')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN is_signed INTEGER NOT NULL DEFAULT 0");
}
if (!orderColNames.includes('is_paid')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN is_paid INTEGER NOT NULL DEFAULT 0");
}
if (!orderColNames.includes('remark')) {
  sqlite.exec("ALTER TABLE training_order ADD COLUMN remark TEXT NOT NULL DEFAULT ''");
}

const userColumns = sqlite.prepare("PRAGMA table_info(users)").all() as { name: string }[];
const userColNames = userColumns.map(c => c.name);
if (!userColNames.includes('team')) {
  sqlite.exec("ALTER TABLE users ADD COLUMN team TEXT NOT NULL DEFAULT ''");
}

sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_training_order_user_id ON training_order(user_id);
  CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name);
  CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone);
  CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project);
  CREATE INDEX IF NOT EXISTS idx_training_order_business_type ON training_order(business_type);
  CREATE INDEX IF NOT EXISTS idx_training_order_is_signed ON training_order(is_signed);
  CREATE INDEX IF NOT EXISTS idx_training_order_is_paid ON training_order(is_paid);
  CREATE INDEX IF NOT EXISTS idx_training_order_created_at ON training_order(created_at);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);

const crypto = require('crypto');

// 将旧admin升级为super_admin
const adminRow = sqlite.prepare("SELECT id, role FROM users WHERE username = 'admin'").get() as { id: string; role: string } | undefined;
if (!adminRow) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
  const adminId = crypto.randomUUID();
  const now = Date.now();
  sqlite.prepare(
    "INSERT INTO users (id, username, password_hash, real_name, role, team, is_active, created_at) VALUES (?, ?, ?, ?, 'super_admin', '', 1, ?)"
  ).run(adminId, 'admin', `${salt}:${hash}`, '超级管理员', now);
} else if (adminRow.role !== 'super_admin') {
  sqlite.prepare("UPDATE users SET role = 'super_admin', real_name = '超级管理员' WHERE id = ?").run(adminRow.id);
}

// 创建第二个超管 superadmin/super123
const superAdminExists = sqlite.prepare("SELECT id FROM users WHERE username = 'superadmin'").get();
if (!superAdminExists) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('super123', salt, 10000, 64, 'sha512').toString('hex');
  const saId = crypto.randomUUID();
  const now = Date.now();
  sqlite.prepare(
    "INSERT INTO users (id, username, password_hash, real_name, role, team, is_active, created_at) VALUES (?, ?, ?, ?, 'super_admin', '', 1, ?)"
  ).run(saId, 'superadmin', `${salt}:${hash}`, '超级管理员2', now);
}

// 初始化项目选项
const DEFAULT_PROJECT_OPTIONS = [
  '二级建造师', '一级建造师', '消防工程师', '监理工程师', '造价工程师', '安全工程师',
  '建工单位', '学历', '三类', '七大员', '技工', '特种工', '公路水运检测师',
  '中级经济师', '执业药师', '健康管理师', '初中高级职称', '论文',
];
const settingExists = sqlite.prepare("SELECT key FROM system_settings WHERE key = 'exam_project_options'").get();
if (!settingExists) {
  sqlite.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?)").run(
    'exam_project_options', JSON.stringify(DEFAULT_PROJECT_OPTIONS)
  );
}

const db = drizzle(sqlite);

@Global()
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
