import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { TrainingOrderModule } from './modules/training-order/training-order.module';
import { UserModule } from './modules/user/user.module';
import { ViewModule } from './modules/view/view.module';

// Vercel 环境下不需要 ViewModule（前端由 Vercel 静态文件服务处理）
const isVercel = !!process.env.VERCEL || !!process.env.DATABASE_URL;

@Module({
  imports: [
    TrainingOrderModule,
    UserModule,
    ...(isVercel ? [] : [ViewModule]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
