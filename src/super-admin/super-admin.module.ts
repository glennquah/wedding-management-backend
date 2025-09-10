import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, UserService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
