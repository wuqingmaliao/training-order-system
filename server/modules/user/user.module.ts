import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, StaffController } from './user.controller';
import { DatabaseRootModule } from '../../database/database.module';

@Module({
  imports: [DatabaseRootModule],
  controllers: [UserController, StaffController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
