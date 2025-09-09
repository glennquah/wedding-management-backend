import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [AdminController],
  providers: [AdminService, UserService],
  exports: [AdminService],
})
export class AdminModule {}
