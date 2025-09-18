import { Module } from '@nestjs/common';
import { SeatingArrangementController } from './seating-arrangement.controller';
import { SeatingArrangementService } from './seating-arrangement.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeatingArrangementController],
  providers: [SeatingArrangementService],
  exports: [SeatingArrangementService],
})
export class SeatingArrangementModule {}