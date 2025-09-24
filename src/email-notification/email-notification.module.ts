import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationDetailsModule } from '../notification-details/notification-details.module';
import { EmailNotificationController } from './email-notification.controller';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [JwtModule, NotificationDetailsModule],
  controllers: [EmailNotificationController],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService],
})
export class EmailNotificationModule {}
