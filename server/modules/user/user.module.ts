import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UserManageController, StaffController } from './user.controller';

@Module({
  controllers: [UserController, UserManageController, StaffController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
