import { Injectable, NotFoundException } from '@nestjs/common';
import { Guest } from '@prisma/client';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

type GuestWithAccompanying = Guest & {
  accompanyingGuests?: Guest[];
};

@Injectable()
export class GuestService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    // Validate that the wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    return this.prisma.guest.create({
      data: dto,
      include: {
        accompanyingGuests: true,
      },
    });
  }

  async findByWeddingId(weddingId: number): Promise<Guest[]> {
    return this.prisma.guest.findMany({
      where: { weddingId },
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllGuest(): Promise<Guest[]> {
    return this.prisma.guest.findMany({
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number): Promise<Guest> {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }

    return guest;
  }

  async update(id: number, dto: UpdateGuestDto): Promise<Guest> {
    await this.findById(id);

    if (dto.confirmationStatus === ConfirmationStatus.CONFIRMED) {
      await this.prisma.guest.updateMany({
        where: { primaryGuestId: id },
        data: { confirmationStatus: ConfirmationStatus.CONFIRMED },
      });
    }

    return this.prisma.guest.update({
      where: { id },
      data: dto,
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.guest.delete({
      where: { id },
    });
  }

  async deleteByWeddingId(weddingId: number): Promise<void> {
    await this.prisma.guest.deleteMany({
      where: { weddingId },
    });
  }

  async createMultiple(guests: CreateGuestDto[]): Promise<Guest[]> {
    const createdGuests = await Promise.all(
      guests.map((guest) => this.create(guest)),
    );
    return createdGuests;
  }

  toGuestResponseDto(guest: GuestWithAccompanying): GuestResponseDto {
    return {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      allergies: guest.allergies,
      group: guest.group,
      confirmationStatus: guest.confirmationStatus as ConfirmationStatus,
      weddingId: guest.weddingId,
      primaryGuestId: guest.primaryGuestId,
      accompanyingGuests: guest.accompanyingGuests?.map((g) =>
        this.toGuestResponseDto(g),
      ),
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt,
    };
  }
}
