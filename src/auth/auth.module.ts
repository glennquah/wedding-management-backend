import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestUserService } from 'src/test-user/test-user.service';
import { VendorService } from 'src/vendor/vendor.service';
import { AdminService } from 'src/admin/admin.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TestUserService, JwtService, VendorService, AdminService],
})
export class AuthModule {}
