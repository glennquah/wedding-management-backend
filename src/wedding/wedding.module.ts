import { Module } from '@nestjs/common';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeddingController],
  providers: [WeddingService],
  exports: [WeddingService],
})
export class WeddingModule {}