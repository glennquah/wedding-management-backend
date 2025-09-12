import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { PrismaService } from '../prisma/prisma.service'; // assuming you have a global PrismaService

@Module({
  controllers: [ListingController],
  providers: [ListingService, PrismaService],
  exports: [ListingService],
})
export class ListingModule {}
