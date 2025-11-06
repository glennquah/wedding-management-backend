import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailNotificationModule } from '../email-notification/email-notification.module';
import { PaymentModule } from '../payment/payment.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    PaymentModule,
    EmailNotificationModule,
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
