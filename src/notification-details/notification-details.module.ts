import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationDetailsController } from './notification-details.controller';
import { NotificationDetailsService } from './notification-details.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [NotificationDetailsController],
  providers: [NotificationDetailsService],
  exports: [NotificationDetailsService],
})
export class NotificationDetailsModule {}
