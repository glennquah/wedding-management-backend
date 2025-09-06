import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, JwtService],
  exports: [SuperAdminService],
})
export class AdminModule {}
