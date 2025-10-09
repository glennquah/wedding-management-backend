import { Injectable, NotFoundException } from '@nestjs/common';
import { Gift } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { GiftResponseDto } from './dto/gift-response.dto';

@Injectable()
export class GiftService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGiftDto): Promise<Gift> {
    // Validate that the wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    return this.prisma.gift.create({
      data: {
        guestName: dto.guestName,
        amount: dto.amount,
        weddingId: dto.weddingId,
      },
    });
  }

  async findByWeddingId(weddingId: number): Promise<Gift[]> {
    return this.prisma.gift.findMany({
      where: { weddingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Gift> {
    const gift = await this.prisma.gift.findUnique({
      where: { id },
    });

    if (!gift) {
      throw new NotFoundException(`Gift with ID ${id} not found`);
    }

    return gift;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.gift.delete({
      where: { id },
    });
  }

  toGiftResponseDto(gift: Gift): GiftResponseDto {
    return {
      id: gift.id,
      guestName: gift.guestName,
      amount: gift.amount,
      weddingId: gift.weddingId,
      createdAt: gift.createdAt,
      updatedAt: gift.updatedAt,
    };
  }
}
