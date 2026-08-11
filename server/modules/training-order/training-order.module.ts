import { Module } from '@nestjs/common';

import { TrainingOrderController } from './training-order.controller';
import { AdminAuthController } from './admin-auth.controller';
import { TrainingOrderService } from './training-order.service';
import { DatabaseRootModule } from '../../database/database.module';

@Module({
  imports: [DatabaseRootModule],
  controllers: [TrainingOrderController, AdminAuthController],
  providers: [TrainingOrderService],
})
export class TrainingOrderModule {}
