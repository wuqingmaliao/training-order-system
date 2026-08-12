import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { TrainingOrderModule } from './modules/training-order/training-order.module';
import { UserModule } from './modules/user/user.module';
import { ViewModule } from './modules/view/view.module';
import { DatabaseRootModule } from './database/database.module';

// 本地开发用 AppModule（Vercel 使用 vercel-app.module.ts）
@Module({
  imports: [
    DatabaseRootModule,
    TrainingOrderModule,
    UserModule,
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
