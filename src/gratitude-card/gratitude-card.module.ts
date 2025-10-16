import { Module } from '@nestjs/common';
import { GratitudeCardService } from './gratitude-card.service';
import { GratitudeCardController } from './gratitude-card.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  providers: [GratitudeCardService],
  controllers: [GratitudeCardController],
  exports: [GratitudeCardService],
})
export class GratitudeCardModule {}
