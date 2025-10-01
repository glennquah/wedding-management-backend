import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailNotificationModule } from 'src/email-notification/email-notification.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    UserModule,
    JwtModule,
    EmailNotificationModule,
    EmailNotificationModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
