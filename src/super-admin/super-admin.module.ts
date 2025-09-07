import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, UserService, JwtService],
  exports: [SuperAdminService],
})
export class AdminModule {}
