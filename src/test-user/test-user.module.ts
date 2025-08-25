import { Module } from '@nestjs/common';
import { TestUserService } from './test-user.service';
import { TestUserController } from './test-user.controller';

@Module({
  providers: [TestUserService],
  controllers: [TestUserController]
})
export class TestUserModule {}
