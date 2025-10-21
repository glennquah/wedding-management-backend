import { Module } from '@nestjs/common';
import { MicrositeController } from './microsite.controller';
import { MicrositeService } from './microsite.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AiServiceModule } from '../ai-service/ai-service.module';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule, AiServiceModule],
  controllers: [MicrositeController],
  providers: [MicrositeService],
  exports: [MicrositeService],
})
export class MicrositeModule {}
