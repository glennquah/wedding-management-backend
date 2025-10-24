import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Patch,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/user-role.enum';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';
import { ReserveWishlistItemDto } from './dto/reserve-wishlist-item.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a wishlist item' })
  @ApiResponse({
    status: 201,
    description: 'Wishlist item created successfully',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async create(
    @Body() createDto: CreateWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    return this.wishlistService.create(createDto);
  }

  @Get('wedding/:weddingId')
  @ApiOperation({ summary: 'Get all wishlist items for a wedding (public)' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist items retrieved successfully',
    type: [WishlistItemResponseDto],
  })
  async findAllByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<WishlistItemResponseDto[]> {
    return this.wishlistService.findAllByWeddingId(weddingId);
  }

  @Get('wedding/:weddingId/check')
  @ApiOperation({ summary: 'Check if a wedding has wishlist items' })
  @ApiResponse({
    status: 200,
    description: 'Check result',
    schema: {
      type: 'object',
      properties: {
        hasItems: { type: 'boolean' },
      },
    },
  })
  async checkWishlistExists(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<{ hasItems: boolean }> {
    const hasItems = await this.wishlistService.hasWishlistItems(weddingId);
    return { hasItems };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wishlist item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item retrieved successfully',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wishlist item not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WishlistItemResponseDto> {
    return this.wishlistService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a wishlist item' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item updated successfully',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    return this.wishlistService.update(id, updateDto);
  }

  @Patch(':id/reserve')
  @ApiOperation({ summary: 'Reserve or unreserve a wishlist item (public)' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item reservation updated successfully',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Item already reserved.' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found.' })
  async reserve(
    @Param('id', ParseIntPipe) id: number,
    @Body() reserveDto: ReserveWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    return this.wishlistService.reserve(id, reserveDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a wishlist item' })
  @ApiResponse({
    status: 204,
    description: 'Wishlist item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Wishlist item not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.wishlistService.delete(id);
  }
}
