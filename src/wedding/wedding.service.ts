import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { Wedding, Guest } from '@prisma/client';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { GuestService } from '../guest/guest.service';

type WeddingWithGuests = Wedding & {
  guests?: Guest[];
};

@Injectable()
export class WeddingService {
  constructor(
    private prisma: PrismaService,
    private guestService: GuestService
  ) {}

  async create(dto: CreateWeddingDto): Promise<Wedding> {
    return this.prisma.wedding.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        location: dto.location,
      },
    });
  }

  async findAll(): Promise<Wedding[]> {
    return this.prisma.wedding.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Wedding> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id },
      include: {
        guests: true,
      },
    });
    
    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${id} not found`);
    }
    
    return wedding;
  }

  async update(id: number, dto: UpdateWeddingDto): Promise<Wedding> {
    await this.findById(id);
    
    const updateData: Partial<Wedding> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.location !== undefined) updateData.location = dto.location;
    
    return this.prisma.wedding.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    
    await this.prisma.wedding.delete({
      where: { id },
    });
  }

  toWeddingResponseDto(wedding: WeddingWithGuests): WeddingResponseDto {
    return {
      id: wedding.id,
      name: wedding.name,
      date: wedding.date.toISOString(),
      location: wedding.location,
      guests: wedding.guests?.map(guest => this.guestService.toGuestResponseDto(guest)),
      createdAt: wedding.createdAt.toISOString(),
      updatedAt: wedding.updatedAt.toISOString(),
    };
  }
}