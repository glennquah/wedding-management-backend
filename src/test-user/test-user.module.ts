import { Module } from '@nestjs/common';
import { TestUserController } from './test-user.controller';
import { TestUserService } from './test-user.service';

@Module({
  providers: [TestUserService],
  controllers: [TestUserController],
})
export class TestUserModule {}
