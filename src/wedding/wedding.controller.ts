import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { WeddingService } from './wedding.service';

@ApiTags('weddings')
@Controller('weddings')
// @UseGuards(JwtGuard) // Temporarily disabled for testing
export class WeddingController {
  constructor(private service: WeddingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wedding' })
  @ApiResponse({
    status: 201,
    description: 'The wedding has been successfully created.',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() body: CreateWeddingDto): Promise<WeddingResponseDto> {
    const wedding = await this.service.create(body);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Get()
  @ApiOperation({ summary: 'Get all weddings' })
  @ApiResponse({
    status: 200,
    description: 'List of all weddings',
    type: [WeddingResponseDto],
  })
  async findAll(): Promise<WeddingResponseDto[]> {
    const weddings = await this.service.findAll();
    return weddings.map((wedding) =>
      this.service.toWeddingResponseDto(wedding),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wedding by ID' })
  @ApiResponse({
    status: 200,
    description: 'The wedding details',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WeddingResponseDto> {
    const wedding = await this.service.findById(id);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a wedding' })
  @ApiResponse({
    status: 200,
    description: 'The wedding has been successfully updated.',
    type: WeddingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateWeddingDto,
  ): Promise<WeddingResponseDto> {
    const wedding = await this.service.update(id, body);
    return this.service.toWeddingResponseDto(wedding);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wedding' })
  @ApiResponse({
    status: 200,
    description: 'The wedding has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.delete(id);
  }
}
