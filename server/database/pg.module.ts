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

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: async () => {
        const db = getDb();
        try {
          const adminResult = await db.execute(sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`);
          if (adminResult.rows.length === 0) {
            const crypto = require('crypto');
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');
            const adminId = crypto.randomUUID();
            await db.execute(sql`
              INSERT INTO users (id, username, password_hash, real_name, role, is_active)
              VALUES (${adminId}, 'admin', ${`${salt}:${hash}`}, '管理员', 'admin', TRUE)
            `);
          }
        } catch (e) {
          console.warn('初始化管理员时出错（表可能尚未创建）:', (e as Error).message);
        }
        return db;
      },
    },
  ],
  exports: [DB_TOKEN],
})
export class PgDatabaseModule {}
