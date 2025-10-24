import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WishlistItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { UpdateWishlistItemDto } from './dto/update-wishlist-item.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';
import { ReserveWishlistItemDto } from './dto/reserve-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  private toWishlistItemResponseDto(
    item: WishlistItem,
  ): WishlistItemResponseDto {
    return {
      id: item.id,
      title: item.title,
      itemUrl: item.itemUrl,
      isReserved: item.isReserved,
      weddingId: item.weddingId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async create(
    dto: CreateWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(
        `Wedding with ID ${dto.weddingId} not found`,
      );
    }

    const item = await this.prisma.wishlistItem.create({
      data: {
        title: dto.title,
        itemUrl: dto.itemUrl,
        weddingId: dto.weddingId,
      },
    });

    return this.toWishlistItemResponseDto(item);
  }

  async findAllByWeddingId(
    weddingId: number,
  ): Promise<WishlistItemResponseDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { weddingId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => this.toWishlistItemResponseDto(item));
  }

  async findOne(id: number): Promise<WishlistItemResponseDto> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }

    return this.toWishlistItemResponseDto(item);
  }

  async update(
    id: number,
    dto: UpdateWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    // Verify item exists
    await this.findOne(id);

    const item = await this.prisma.wishlistItem.update({
      where: { id },
      data: dto,
    });

    return this.toWishlistItemResponseDto(item);
  }

  async reserve(
    id: number,
    dto: ReserveWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    // Verify item exists
    const existingItem = await this.findOne(id);

    // Check if trying to reserve an already reserved item
    if (dto.isReserved && existingItem.isReserved) {
      throw new BadRequestException('This item is already reserved');
    }

    const item = await this.prisma.wishlistItem.update({
      where: { id },
      data: { isReserved: dto.isReserved },
    });

    return this.toWishlistItemResponseDto(item);
  }

  async delete(id: number): Promise<WishlistItemResponseDto> {
    // Verify item exists
    await this.findOne(id);

    const item = await this.prisma.wishlistItem.delete({
      where: { id },
    });

    return this.toWishlistItemResponseDto(item);
  }

  async hasWishlistItems(weddingId: number): Promise<boolean> {
    const count = await this.prisma.wishlistItem.count({
      where: { weddingId },
    });

    return count > 0;
  }
}
