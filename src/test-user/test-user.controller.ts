import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestUserService } from './test-user.service';
import { TestUser } from '@prisma/client';
import { CreateTestUserDto } from './dto/create-test-user.dto';

@ApiTags('test-users')
@Controller('test-users')
export class TestUserController {
  constructor(private service: TestUserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test user' })
  @ApiResponse({ status: 201, description: 'The test user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateTestUserDto): Promise<TestUser> {
    return this.service.create(body);
  }
}
