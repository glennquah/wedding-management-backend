import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from 'src/admin/admin.service';
import { EmailNotificationModule } from 'src/email-notification/email-notification.module';
import { SuperAdminService } from 'src/super-admin/super-admin.service';
import { UserService } from 'src/user/user.service';
import { VendorService } from 'src/vendor/vendor.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [EmailNotificationModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtService,
    VendorService,
    AdminService,
    SuperAdminService,
  ],
})
export class AuthModule {}
