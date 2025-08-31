import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestUserController } from './test-user.controller';
import { TestUserService } from './test-user.service';

@Module({
  providers: [TestUserService, JwtService],
  controllers: [TestUserController],
})
export class TestUserModule {}
