import { Injectable, NotFoundException } from '@nestjs/common';
import { Listing, WeddingStyle, WeddingType } from '@prisma/client';
import { VendorService } from 'src/vendor/vendor.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { WeddingService } from 'src/common/wedding-service.enum';

interface BrowseFilters {
  service?: WeddingService;
  minPrice?: number;
  maxPrice?: number;
  availableDate?: string;
  style?: WeddingStyle;
  weddingType?: WeddingType;
  minRating?: number;
  minCapacity?: number;
  search?: string;
  sortBy: 'price' | 'rating' | 'createdAt' | 'listingName';
  sortOrder: 'asc' | 'desc';
  limit: number;
  offset: number;
}

interface BrowseResult {
  listings: (Listing & {
    vendor: {
      rating: number;
      capacity: number;
      styleOffered: WeddingStyle;
      weddingTypes: WeddingType[];
      user: {
        name: string;
        email: string;
      };
    };
  })[];
  total: number;
}

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

  async getAllByService(service: WeddingService): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      where: {
        vendor: {
          serviceOffered: service,
        },
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async browseListings(filters: BrowseFilters): Promise<BrowseResult> {
    const where: any = {};

    // Service filter
    if (filters.service) {
      where.vendor = {
        ...where.vendor,
        serviceOffered: filters.service,
      };
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Style filter
    if (filters.style) {
      where.vendor = {
        ...where.vendor,
        styleOffered: filters.style,
      };
    }

    // Wedding type filter
    if (filters.weddingType) {
      where.vendor = {
        ...where.vendor,
        weddingTypes: {
          has: filters.weddingType,
        },
      };
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      where.vendor = {
        ...where.vendor,
        rating: {
          gte: filters.minRating,
        },
      };
    }

    // Capacity filter
    if (filters.minCapacity !== undefined) {
      where.vendor = {
        ...where.vendor,
        capacity: {
          gte: filters.minCapacity,
        },
      };
    }

    // Text search filter
    if (filters.search) {
      where.OR = [
        {
          listingName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          remarks: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          vendor: {
            user: {
              name: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    // Date availability filter (check if date falls within any availability slot)
    if (filters.availableDate) {
      const targetDate = new Date(filters.availableDate);
      where.availabilities = {
        path: '$[*]',
        array_contains: {
          date: filters.availableDate,
        },
      };
    }

    // Build orderBy
    const orderBy: any = {};
    if (filters.sortBy === 'rating') {
      orderBy.vendor = { rating: filters.sortOrder };
    } else if (filters.sortBy === 'price') {
      orderBy.price = filters.sortOrder;
    } else if (filters.sortBy === 'listingName') {
      orderBy.listingName = filters.sortOrder;
    } else {
      orderBy.createdAt = filters.sortOrder;
    }

    // Get total count
    const total = await this.prisma.listing.count({ where });

    // Get listings with pagination
    const listings = await this.prisma.listing.findMany({
      where,
      include: {
        vendor: {
          select: {
            rating: true,
            capacity: true,
            styleOffered: true,
            weddingTypes: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: filters.offset,
      take: filters.limit,
    });

    return { listings, total };
  }

  async searchListingsAdvanced(filters: BrowseFilters): Promise<BrowseResult> {
    // For advanced search, we enhance the text search to be more comprehensive
    const enhancedFilters = { ...filters };

    if (filters.search) {
      // Split search terms and create more sophisticated search
      const searchTerms = filters.search
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      // For now, we'll use the same logic as browse but this could be enhanced
      // with more sophisticated text matching, fuzzy search, etc.
      return this.browseListings(enhancedFilters);
    }

    return this.browseListings(enhancedFilters);
  }

  toListingResponseDto(listing: Listing): ListingResponseDto {
    return {
      id: listing.id,
      listingName: listing.listingName,
      price: listing.price,
      availabilities: JSON.parse(JSON.stringify(listing.availabilities)),
      remarks: listing.remarks,
      vendorId: listing.vendorId,
      imageUrls: listing.imageUrls,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }
}
