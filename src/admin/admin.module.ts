import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [AdminService, JwtService],
  exports: [AdminService],
})
export class AdminModule {}
