import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { AdminAuthMiddleware } from '../../common/middleware/admin-auth.middleware';
import { TrainingOrderController } from './training-order.controller';
import { AdminAuthController } from './admin-auth.controller';
import { TrainingOrderService } from './training-order.service';
import { SqliteDatabaseModule } from '../../database/sqlite.module';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [TrainingOrderController, AdminAuthController],
  providers: [TrainingOrderService],
})
export class TrainingOrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminAuthMiddleware)
      .exclude(
        { path: 'api/training-orders', method: RequestMethod.POST },
        { path: 'api/admin/login', method: RequestMethod.POST },
      )
      .forRoutes('api/training-orders', 'api/admin');
  }
}
