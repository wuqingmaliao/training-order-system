import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, StaffController } from './user.controller';

@Module({
  controllers: [UserController, StaffController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
