import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Module({
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
