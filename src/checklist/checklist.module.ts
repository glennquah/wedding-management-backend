import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ChecklistController],
  providers: [ChecklistService],
  exports: [ChecklistService],
})
export class ChecklistModule {}
