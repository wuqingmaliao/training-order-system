import { Module } from '@nestjs/common';

// 根据环境变量选择数据库：
// - 有 DATABASE_URL 时使用 PostgreSQL（Vercel + Supabase）
// - 没有时使用 SQLite（本地开发）
// 使用变量拼接 require 路径，避免打包工具静态分析到 better-sqlite3 原生模块
const isPg = !!process.env.DATABASE_URL;
const modulePath = isPg ? './pg' : './sqlite';
const mod = require(modulePath + '.module');
const dbModule = isPg ? mod.PgDatabaseModule : mod.SqliteDatabaseModule;

@Module({
  imports: [dbModule],
  exports: [dbModule],
})
export class DatabaseRootModule {}
