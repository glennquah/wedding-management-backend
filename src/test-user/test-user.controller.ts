import { Body, Controller, Post } from '@nestjs/common';
import { TestUserService } from './test-user.service';
import { TestUser } from '@prisma/client';
import { CreateTestUserDto } from './dto/create-test-user.dto';

@Controller('test-users')
export class TestUserController {
  constructor(private service: TestUserService) {}

  @Post()
  async create(@Body() body: CreateTestUserDto): Promise<TestUser> {
    return this.service.create(body);
  }
}
