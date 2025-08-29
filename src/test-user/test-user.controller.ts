import { Body, Controller, Get, Param, Post, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateTestUserDto } from './dto/create-test-user.dto';
import { TestUserResponseDto } from './dto/test-user-response.dto';
import { TestUserService } from './test-user.service';

@ApiTags('test-users')
@Controller('test-users')
export class TestUserController {
  constructor(private service: TestUserService) {}

  // NOTE: deprecated, shifted to AuthModule
  @Post()
  @ApiOperation({ summary: 'Create a new test user' })
  @ApiResponse({
    status: 201,
    description: 'The test user has been successfully created.',
    type: TestUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateTestUserDto): Promise<TestUserResponseDto> {
    return this.service.create(body);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }
}
