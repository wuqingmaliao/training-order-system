import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './pg-schema';
import { DB_TOKEN } from './token';
export type PgDatabase = ReturnType<typeof drizzle<typeof schema>>;

// Vercel Serverless 环境下复用连接
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
  pgDb: PgDatabase | undefined;
};

function getDb(): PgDatabase {
  if (!globalForDb.pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    globalForDb.pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });
  }
  if (!globalForDb.pgDb) {
    globalForDb.pgDb = drizzle(globalForDb.pgPool, { schema });
  }
  return globalForDb.pgDb;
}

async function columnExists(db: PgDatabase, table: string, column: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = ${table} AND column_name = ${column}
  `);
  return result.rows.length > 0;
}

async function initDatabase(db: PgDatabase) {
  // 建表
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      real_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      team TEXT NOT NULL DEFAULT '',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS training_order (
      id TEXT PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      business_type TEXT NOT NULL DEFAULT '',
      is_signed BOOLEAN NOT NULL DEFAULT FALSE,
      is_paid BOOLEAN NOT NULL DEFAULT FALSE,
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
      user_id TEXT REFERENCES users(id),
      created_by_name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 迁移：添加新列
  if (!(await columnExists(db, 'training_order', 'business_type'))) {
    await db.execute(sql`ALTER TABLE training_order ADD COLUMN business_type TEXT NOT NULL DEFAULT ''`);
  }
  if (!(await columnExists(db, 'training_order', 'is_signed'))) {
    await db.execute(sql`ALTER TABLE training_order ADD COLUMN is_signed BOOLEAN NOT NULL DEFAULT FALSE`);
  }
  if (!(await columnExists(db, 'training_order', 'is_paid'))) {
    await db.execute(sql`ALTER TABLE training_order ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE`);
  }
  if (!(await columnExists(db, 'training_order', 'remark'))) {
    await db.execute(sql`ALTER TABLE training_order ADD COLUMN remark TEXT NOT NULL DEFAULT ''`);
  }
  if (!(await columnExists(db, 'users', 'team'))) {
    await db.execute(sql`ALTER TABLE users ADD COLUMN team TEXT NOT NULL DEFAULT ''`);
  }

  // 修复旧表缺少 DEFAULT 值的 NOT NULL 列（线上旧表可能在建表时未设默认值）
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN training_type SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN customer_source SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN contract_status SET DEFAULT '未签约'`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN original_price SET DEFAULT 0`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN promised_student SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN referrer SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN id_card SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN phone SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN exam_project SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN class_major SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN actual_payment SET DEFAULT 0`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN discounted_price SET DEFAULT 0`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN remaining_amount SET DEFAULT 0`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN person_in_charge SET DEFAULT ''`);
  await db.execute(sql`ALTER TABLE training_order ALTER COLUMN created_by_name SET DEFAULT ''`);

  // 索引
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_user_id ON training_order(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_student_name ON training_order(student_name)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_phone ON training_order(phone)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_exam_project ON training_order(exam_project)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_business_type ON training_order(business_type)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_is_signed ON training_order(is_signed)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_is_paid ON training_order(is_paid)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_training_order_created_at ON training_order(created_at)`);

  const crypto = require('crypto');

  // admin升级为super_admin
  const adminResult = await db.execute(sql`SELECT id, role FROM users WHERE username = 'admin' LIMIT 1`);
  if (adminResult.rows.length === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
    const adminId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO users (id, username, password_hash, real_name, role, team, is_active)
      VALUES (${adminId}, 'admin', ${`${salt}:${hash}`}, '超级管理员', 'super_admin', '', TRUE)
    `);
  } else if (adminResult.rows[0].role !== 'super_admin') {
    await db.execute(sql`UPDATE users SET role = 'super_admin', real_name = '超级管理员' WHERE username = 'admin'`);
  }

  // 第二个超管
  const saResult = await db.execute(sql`SELECT id FROM users WHERE username = 'superadmin' LIMIT 1`);
  if (saResult.rows.length === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('super123', salt, 10000, 64, 'sha512').toString('hex');
    const saId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO users (id, username, password_hash, real_name, role, team, is_active)
      VALUES (${saId}, 'superadmin', ${`${salt}:${hash}`}, '超级管理员2', 'super_admin', '', TRUE)
    `);
  }

  // 初始化项目选项
  const DEFAULT_PROJECT_OPTIONS = [
    '二级建造师', '一级建造师', '消防工程师', '监理工程师', '造价工程师', '安全工程师',
    '建工单位', '学历', '三类', '七大员', '技工', '特种工', '公路水运检测师',
    '中级经济师', '执业药师', '健康管理师', '初中高级职称', '论文',
  ];
  const settingResult = await db.execute(sql`SELECT key FROM system_settings WHERE key = 'exam_project_options' LIMIT 1`);
  if (settingResult.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO system_settings (key, value) VALUES ('exam_project_options', ${JSON.stringify(DEFAULT_PROJECT_OPTIONS)})
    `);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: async () => {
        const db = getDb();
        try {
          await initDatabase(db);
        } catch (e) {
          console.warn('数据库初始化出错:', (e as Error).message);
        }
        return db;
      },
    },
  ],
  exports: [DB_TOKEN],
})
export class PgDatabaseModule {}
