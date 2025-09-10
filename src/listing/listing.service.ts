import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingResponseDto } from './dto/listing-response.dto';


@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  async create(vendorId: number, dto: CreateListingDto) {
    return this.prisma.listing.create({
      data: {
        ...dto,
        vendorId, // ensures vendor is set from auth/context
      },
    });
  }

  async update(vendorId: number, id: number, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.vendorId !== vendorId) {
      throw new NotFoundException('Listing not found or not owned by vendor');
    }

    return this.prisma.listing.update({
      where: { id },
      data: dto,
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
