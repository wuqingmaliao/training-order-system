import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { TrainingOrderModule } from './modules/training-order/training-order.module';
import { ViewModule } from './modules/view/view.module';

@Module({
  imports: [
    TrainingOrderModule,
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
