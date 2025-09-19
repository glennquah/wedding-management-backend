import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeatingArrangementService } from './seating-arrangement.service';
import { CreateSeatingArrangementDto } from './dto/create-seating-arrangement.dto';
import { UpdateSeatingArrangementDto } from './dto/update-seating-arrangement.dto';
import { SeatingArrangementResponseDto } from './dto/seating-arrangement-response.dto';

@ApiTags('seating-arrangements')
@Controller('weddings/:weddingId/seating-arrangement')
export class SeatingArrangementController {
  constructor(
    private readonly seatingArrangementService: SeatingArrangementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create seating arrangement for a wedding' })
  @ApiParam({ name: 'weddingId', type: 'number', description: 'Wedding ID' })
  @ApiResponse({
    status: 201,
    description: 'Seating arrangement created successfully.',
    type: SeatingArrangementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  @ApiResponse({
    status: 409,
    description: 'Seating arrangement already exists.',
  })
  create(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() createSeatingArrangementDto: CreateSeatingArrangementDto,
  ): Promise<SeatingArrangementResponseDto> {
    return this.seatingArrangementService.create(
      weddingId,
      createSeatingArrangementDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get seating arrangement for a wedding' })
  @ApiParam({ name: 'weddingId', type: 'number', description: 'Wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Seating arrangement found.',
    type: SeatingArrangementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Seating arrangement not found.' })
  async findOne(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<SeatingArrangementResponseDto | null> {
    return this.seatingArrangementService.findByWeddingId(weddingId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update seating arrangement for a wedding' })
  @ApiParam({ name: 'weddingId', type: 'number', description: 'Wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Seating arrangement updated successfully.',
    type: SeatingArrangementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Seating arrangement not found.' })
  update(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() updateSeatingArrangementDto: UpdateSeatingArrangementDto,
  ): Promise<SeatingArrangementResponseDto> {
    return this.seatingArrangementService.update(
      weddingId,
      updateSeatingArrangementDto,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete seating arrangement for a wedding' })
  @ApiParam({ name: 'weddingId', type: 'number', description: 'Wedding ID' })
  @ApiResponse({
    status: 204,
    description: 'Seating arrangement deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Seating arrangement not found.' })
  remove(@Param('weddingId', ParseIntPipe) weddingId: number): Promise<void> {
    return this.seatingArrangementService.remove(weddingId);
  }
}
