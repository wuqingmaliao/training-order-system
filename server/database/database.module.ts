import { Module } from '@nestjs/common';
import { PgDatabaseModule } from './pg.module';
import { SqliteDatabaseModule } from './sqlite.module';

// 根据环境变量选择数据库：
// - 有 DATABASE_URL 时使用 PostgreSQL（Vercel + Supabase）
// - 没有时使用 SQLite（本地开发）
const isPg = !!process.env.DATABASE_URL;

@Module({
  imports: [isPg ? PgDatabaseModule : SqliteDatabaseModule],
  exports: [isPg ? PgDatabaseModule : SqliteDatabaseModule],
})
export class DatabaseRootModule {}
