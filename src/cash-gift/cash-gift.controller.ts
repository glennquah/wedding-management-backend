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
import { CreateCashGiftDto } from './dto/create-cash-gift.dto';
import { CashGiftResponseDto } from './dto/cash-gift-response.dto';
import { CashGiftService } from './cash-gift.service';

@ApiTags('cash-gifts')
@Controller('cash-gifts')
export class CashGiftController {
  constructor(private cashGiftService: CashGiftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cash gift record for a wedding (public endpoint)' })
  @ApiResponse({
    status: 201,
    description: 'The cash gift record has been successfully created.',
    type: CashGiftResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Wedding or guest not found.' })
  async create(@Body() body: CreateCashGiftDto): Promise<CashGiftResponseDto> {
    const cashGift = await this.cashGiftService.create(body);
    return this.cashGiftService.toCashGiftResponseDto(cashGift);
  }

  @Get('wedding/:weddingId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all cash gifts for a specific wedding' })
  @ApiResponse({
    status: 200,
    description: 'List of cash gifts for the wedding',
    type: [CashGiftResponseDto],
  })
  async getCashGiftsByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<CashGiftResponseDto[]> {
    const cashGifts = await this.cashGiftService.findByWeddingId(weddingId);
    return cashGifts.map((cashGift) => this.cashGiftService.toCashGiftResponseDto(cashGift));
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a cash gift by ID' })
  @ApiResponse({
    status: 200,
    description: 'The cash gift details',
    type: CashGiftResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cash gift not found.' })
  async getCashGift(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CashGiftResponseDto> {
    const cashGift = await this.cashGiftService.findById(id);
    return this.cashGiftService.toCashGiftResponseDto(cashGift);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a cash gift record' })
  @ApiResponse({
    status: 200,
    description: 'The cash gift record has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Cash gift not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.cashGiftService.delete(id);
  }
}
