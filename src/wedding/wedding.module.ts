import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GuestModule } from '../guest/guest.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WeddingController } from './wedding.controller';
import { WeddingService } from './wedding.service';

@Module({
  imports: [PrismaModule, GuestModule, JwtModule],
  controllers: [WeddingController],
  providers: [WeddingService],
  exports: [WeddingService],
})
export class WeddingModule {}
