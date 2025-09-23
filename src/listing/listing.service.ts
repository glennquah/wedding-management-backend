import { Injectable, NotFoundException } from '@nestjs/common';
import { Listing } from '@prisma/client';
import { VendorService } from 'src/vendor/vendor.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingService {
  constructor(
    private prisma: PrismaService,
    private vendorService: VendorService,
  ) {}

  async create(vendorId: number, dto: CreateListingDto): Promise<Listing> {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return this.prisma.listing.create({
      data: {
        ...dto,
        availabilities: JSON.parse(JSON.stringify(dto.availabilities)),
        imageUrls: dto.imageUrls || [],
      },
    });
  }

  async update(
    vendorId: number,
    id: number,
    dto: UpdateListingDto,
  ): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.vendorId !== vendorId) {
      throw new NotFoundException('Listing not found or not owned by vendor');
    }

    const { availabilities, imageUrls, ...restDto } = dto;
    const updateData = {
      ...restDto,
      ...(availabilities && {
        availabilities: JSON.parse(JSON.stringify(availabilities)),
      }),
      ...(imageUrls !== undefined && {
        imageUrls: imageUrls,
      }),
    };

    return this.prisma.listing.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(vendorId: number, id: number): Promise<void> {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.vendorId !== vendorId) {
      throw new NotFoundException('Listing not found or not owned by vendor');
    }

    await this.prisma.listing.delete({ where: { id } });
  }

  async findById(id: number): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  async searchByName(
    vendorId: number,
    listingName: string,
  ): Promise<Listing[]> {
    const vendor = await this.vendorService.findById(vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

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

  toListingResponseDto(listing: Listing): ListingResponseDto {
    return {
      id: listing.id,
      listingName: listing.listingName,
      price: listing.price,
      availabilities: listing.availabilities as any,
      remarks: listing.remarks,
      vendorId: listing.vendorId,
      imageUrls: listing.imageUrls,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }
}
