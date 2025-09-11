import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async create(vendorId: number, dto: CreateListingDto) {
    return this.prisma.listing.create({
      data: {
        ...dto,
        availabilities: dto.availabilities.map((date) => new Date(date)),
      },
    });
  }

  async update(vendorId: number, id: number, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.vendorId !== vendorId) {
      throw new NotFoundException('Listing not found or not owned by vendor');
    }

    const { availabilities, ...restDto } = dto;
    const updateData = {
      ...restDto,
      ...(availabilities && {
        availabilities: availabilities.map((date) => new Date(date)),
      }),
    };

    return this.prisma.listing.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(vendorId: number, id: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.vendorId !== vendorId) {
      throw new NotFoundException('Listing not found or not owned by vendor');
    }

    return this.prisma.listing.delete({ where: { id } });
  }

  async searchByName(vendorId: number, listingName: string) {
    return this.prisma.listing.findMany({
      where: {
        vendorId,
        listingName: {
          contains: listingName,
          mode: 'insensitive', // case-insensitive search
        },
      },
    });
  }
}
