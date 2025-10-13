import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CashGift } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCashGiftDto } from './dto/create-cash-gift.dto';
import { CashGiftResponseDto } from './dto/cash-gift-response.dto';

@Injectable()
export class CashGiftService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCashGiftDto): Promise<CashGift> {
    // Validate that the wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    // Validate that the guest exists and belongs to the wedding
    const guest = await this.prisma.guest.findUnique({
      where: { id: dto.guestId },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${dto.guestId} not found`);
    }

    if (guest.weddingId !== dto.weddingId) {
      throw new BadRequestException(
        `Guest with ID ${dto.guestId} does not belong to wedding with ID ${dto.weddingId}`
      );
    }

    return this.prisma.cashGift.create({
      data: {
        guestId: dto.guestId,
        amount: dto.amount,
        weddingId: dto.weddingId,
      },
      include: {
        guest: true,
      },
    });
  }

  async findByWeddingId(weddingId: number): Promise<CashGift[]> {
    return this.prisma.cashGift.findMany({
      where: { weddingId },
      include: {
        guest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<CashGift> {
    const cashGift = await this.prisma.cashGift.findUnique({
      where: { id },
      include: {
        guest: true,
      },
    });

    if (!cashGift) {
      throw new NotFoundException(`Cash gift with ID ${id} not found`);
    }

    return cashGift;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.cashGift.delete({
      where: { id },
    });
  }

  toCashGiftResponseDto(cashGift: any): CashGiftResponseDto {
    return {
      id: cashGift.id,
      guestId: cashGift.guestId,
      guestName: cashGift.guest?.name || 'Unknown',
      amount: cashGift.amount,
      weddingId: cashGift.weddingId,
      createdAt: cashGift.createdAt,
      updatedAt: cashGift.updatedAt,
    };
  }
}
