import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';

@Module({
  imports: [JwtModule],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}
