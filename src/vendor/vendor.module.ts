import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [VendorController],
  providers: [VendorService, UserService, JwtService],
  exports: [VendorService],
})
export class VendorModule {}
