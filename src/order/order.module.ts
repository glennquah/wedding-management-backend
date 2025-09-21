import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderCleanupService } from './order-cleanup.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PrismaModule, JwtModule, ScheduleModule.forRoot()],
  controllers: [OrderController],
  providers: [OrderService, OrderCleanupService],
  exports: [OrderService],
})
export class OrderModule {}