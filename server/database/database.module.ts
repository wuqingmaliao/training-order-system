import { Module } from '@nestjs/common';

// 根据环境变量选择数据库：
// - 有 DATABASE_URL 时使用 PostgreSQL（Vercel + Supabase）
// - 没有时使用 SQLite（本地开发）
// 使用动态 require 避免在 Vercel 上加载 better-sqlite3 原生模块
let dbModule: any;
if (process.env.DATABASE_URL) {
  const { PgDatabaseModule } = require('./pg.module');
  dbModule = PgDatabaseModule;
} else {
  const { SqliteDatabaseModule } = require('./sqlite.module');
  dbModule = SqliteDatabaseModule;
}

@Module({
  imports: [dbModule],
  exports: [dbModule],
})
export class DatabaseRootModule {}
