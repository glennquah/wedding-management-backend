import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WeddingModule } from 'src/wedding/wedding.module';
import { AiServiceModule } from '../ai-service/ai-service.module';
import { NotificationDetailsModule } from '../notification-details/notification-details.module';
import { EmailNotificationController } from './email-notification.controller';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [
    JwtModule,
    NotificationDetailsModule,
    AiServiceModule,
    forwardRef(() => WeddingModule),
  ],
  controllers: [EmailNotificationController],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService],
})
export class EmailNotificationModule {}
