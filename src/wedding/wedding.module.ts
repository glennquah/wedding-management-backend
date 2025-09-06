import { Module } from '@nestjs/common';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestModule } from '../guest/guest.module';

@Module({
  imports: [PrismaModule, GuestModule],
  controllers: [WeddingController],
  providers: [WeddingService],
  exports: [WeddingService],
})
export class WeddingModule {}