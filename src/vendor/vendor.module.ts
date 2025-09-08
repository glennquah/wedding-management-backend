import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';

@Module({
  imports: [UserModule],
  controllers: [VendorController],
  providers: [VendorService, UserService, JwtService],
  exports: [VendorService],
})
export class VendorModule {}
