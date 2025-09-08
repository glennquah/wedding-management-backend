import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';

@Module({
  imports: [UserModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, UserService, JwtService],
  exports: [SuperAdminService],
})
export class AdminModule {}
