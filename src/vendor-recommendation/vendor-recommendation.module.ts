import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VendorRecommendationController } from './vendor-recommendation.controller';
import { FastApiRecommendationService } from './fastapi-recommendation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule],
  controllers: [VendorRecommendationController],
  providers: [FastApiRecommendationService],
  exports: [FastApiRecommendationService],
})
export class VendorRecommendationModule {}
