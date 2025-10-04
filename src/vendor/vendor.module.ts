import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailNotificationModule } from 'src/email-notification/email-notification.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';

@Module({
  imports: [UserModule, JwtModule, EmailNotificationModule],
  controllers: [VendorController],
  providers: [VendorService, UserService],
  exports: [VendorService],
})
export class VendorModule {}
