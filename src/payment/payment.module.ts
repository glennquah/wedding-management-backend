import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ScheduledPayoutService } from './scheduled-payout.service';
import { InvoiceGeneratorService } from './invoice-generator.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [PaymentController],
  providers: [PaymentService, ScheduledPayoutService, InvoiceGeneratorService],
  exports: [PaymentService],
})
export class PaymentModule {}
