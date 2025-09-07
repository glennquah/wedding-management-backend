import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VendorService } from 'src/vendor/vendor.service';
import { AdminService } from 'src/admin/admin.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SuperAdminService } from 'src/super-admin/super-admin.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, VendorService, AdminService, SuperAdminService],
})
export class AuthModule {}
