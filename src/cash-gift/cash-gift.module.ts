import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CashGiftController } from './cash-gift.controller';
import { CashGiftService } from './cash-gift.service';

@Module({
  imports: [JwtModule],
  controllers: [CashGiftController],
  providers: [CashGiftService],
  exports: [CashGiftService],
})
export class CashGiftModule {}
