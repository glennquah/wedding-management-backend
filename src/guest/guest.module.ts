import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailNotificationModule } from '../email-notification/email-notification.module';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

@Module({
  imports: [JwtModule, EmailNotificationModule],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
