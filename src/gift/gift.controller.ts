import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { CreateGiftDto } from './dto/create-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';
import { GiftService } from './gift.service';

@ApiTags('gifts')
@Controller('gifts')
@UseGuards(JwtGuard, RolesGuard)
export class GiftController {
  constructor(private giftService: GiftService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new gift record for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'The gift record has been successfully created.',
    type: GiftResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async create(@Body() body: CreateGiftDto): Promise<GiftResponseDto> {
    const gift = await this.giftService.create(body);
    return this.giftService.toGiftResponseDto(gift);
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all gifts for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of gifts for the wedding',
    type: [GiftResponseDto],
  })
  async getGiftsByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<GiftResponseDto[]> {
    const gifts = await this.giftService.findByWeddingId(weddingId);
    return gifts.map((gift) => this.giftService.toGiftResponseDto(gift));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a gift by ID' })
  @ApiResponse({
    status: 200,
    description: 'The gift details',
    type: GiftResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Gift not found.' })
  async getGift(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GiftResponseDto> {
    const gift = await this.giftService.findById(id);
    return this.giftService.toGiftResponseDto(gift);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a gift record' })
  @ApiResponse({
    status: 200,
    description: 'The gift record has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Gift not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.giftService.delete(id);
  }
}
