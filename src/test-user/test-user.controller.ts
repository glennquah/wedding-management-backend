import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateTestUserDto } from './dto/create-test-user.dto';
import { TestUserResponseDto } from './dto/test-user-response.dto';
import { toTestUserResponseDto } from './test-user.mapper';
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
    const user = await this.service.create(body);
    return toTestUserResponseDto(user);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a test user profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'The test user profile',
    type: TestUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TestUserResponseDto> {
    const user = await this.service.findById(id);
    return toTestUserResponseDto(user);
  }

}
