import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [VendorController],
  providers: [VendorService, UserService],
  exports: [VendorService],
})
export class VendorModule {}
