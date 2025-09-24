import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SeatingArrangementController } from './seating-arrangement.controller';
import { SeatingArrangementService } from './seating-arrangement.service';
import { FastApiSeatingService } from './fastapi-seating.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule, HttpModule, ConfigModule],
  controllers: [SeatingArrangementController],
  providers: [SeatingArrangementService, FastApiSeatingService],
  exports: [SeatingArrangementService, FastApiSeatingService],
})
export class SeatingArrangementModule {}
