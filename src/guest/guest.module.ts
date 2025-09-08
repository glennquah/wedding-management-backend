import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

@Module({
  controllers: [GuestController],
  providers: [GuestService, JwtService],
  exports: [GuestService],
})
export class GuestModule {}
