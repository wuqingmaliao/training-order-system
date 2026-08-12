import { Module } from '@nestjs/common';

import { TrainingOrderController } from './training-order.controller';
import { AdminAuthController } from './admin-auth.controller';
import { TrainingOrderService } from './training-order.service';

@Module({
  controllers: [TrainingOrderController, AdminAuthController],
  providers: [TrainingOrderService],
})
export class TrainingOrderModule {}
