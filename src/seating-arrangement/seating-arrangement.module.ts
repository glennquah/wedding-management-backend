import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SeatingArrangementController } from './seating-arrangement.controller';
import { SeatingArrangementService } from './seating-arrangement.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [SeatingArrangementController],
  providers: [SeatingArrangementService],
  exports: [SeatingArrangementService],
})
export class SeatingArrangementModule {}
