import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { JwtModule } from '@nestjs/jwt';
import { VendorModule } from 'src/vendor/vendor.module';

@Module({
  imports: [VendorModule, JwtModule],
  controllers: [ListingController],
  providers: [ListingService],
  exports: [ListingService],
})
export class ListingModule {}
