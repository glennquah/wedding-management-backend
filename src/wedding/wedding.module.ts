import { Module } from '@nestjs/common';
import { GuestModule } from '../guest/guest.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';

@Module({
  imports: [PrismaModule, GuestModule],
  controllers: [WeddingController],
  providers: [WeddingService],
  exports: [WeddingService],
})
export class WeddingModule {}
