import { Module } from '@nestjs/common';
import { TrainingOrderModule } from './modules/training-order/training-order.module';
import { UserModule } from './modules/user/user.module';
import { PgDatabaseModule } from './database/pg.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/exception.filter';

// Vercel 专用 AppModule，只使用 PostgreSQL，不加载 SQLite/better-sqlite3
@Module({
  imports: [
    PgDatabaseModule,
    TrainingOrderModule,
    UserModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class VercelAppModule {}
