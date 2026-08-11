import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './pg-schema';

export const DB_TOKEN = 'DB_TOKEN';
export type PgDatabase = ReturnType<typeof drizzle<typeof schema>>;

// Vercel Serverless 环境下复用连接
const globalForDb = globalThis as unknown as {
  pgClient: ReturnType<typeof postgres> | undefined;
  pgDb: PgDatabase | undefined;
};

function getDb(): PgDatabase {
  if (!globalForDb.pgClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    globalForDb.pgClient = postgres(connectionString, {
      max: 1,
      ssl: 'require',
      prepare: false,
    });
  }
  if (!globalForDb.pgDb) {
    globalForDb.pgDb = drizzle(globalForDb.pgClient, { schema });
  }
  return globalForDb.pgDb;
}

@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: async () => {
        const db = getDb();
        try {
          const adminResult = await db.execute(sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`);
          if (adminResult.length === 0) {
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
