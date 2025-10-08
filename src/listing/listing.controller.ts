import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeddingStyle, WeddingType } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { WeddingService } from 'src/common/wedding-service.enum';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingService } from './listing.service';

@ApiTags('listings')
@Controller('listings')
@UseGuards(JwtGuard, RolesGuard)
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post()
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new listing' })
  @ApiResponse({
    status: 201,
    description: 'The listing has been successfully created.',
    type: ListingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() dto: CreateListingDto): Promise<ListingResponseDto> {
    const listing = await this.listingService.create(dto.vendorId, dto);
    return this.listingService.toListingResponseDto(listing);
  }

  @Put(':vendorId/:id')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a listing' })
  @ApiResponse({
    status: 200,
    description: 'The listing has been successfully updated.',
    type: ListingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    const listing = await this.listingService.update(vendorId, id, dto);
    return this.listingService.toListingResponseDto(listing);
  }

  @Delete(':vendorId/:id')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiResponse({
    status: 200,
    description: 'The listing has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  async delete(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.listingService.delete(vendorId, id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a listing by ID' })
  @ApiResponse({
    status: 200,
    description: 'The listing details.',
    type: ListingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const listing = await this.listingService.findById(id);
    return this.listingService.toListingResponseDto(listing);
  }

  @Get(':vendorId/search')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Search listings by vendor name' })
  @ApiResponse({
    status: 200,
    description: 'The listing search results.',
    type: [ListingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async search(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query('listingName') listingName: string,
  ) {
    const listings = await this.listingService.searchByName(
      vendorId,
      listingName,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('venue/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all venue listings' })
  @ApiResponse({
    status: 200,
    description: 'All venue listings.',
    type: [ListingResponseDto],
  })
  async getAllVenues() {
    const listings = await this.listingService.getAllByService(
      WeddingService.VENUE,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('venue/browse')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Browse venue listings with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Filtered venue listings with pagination.',
    schema: {
      type: 'object',
      properties: {
        listings: {
          type: 'array',
          items: { $ref: '#/components/schemas/ListingResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async browseVenues(
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
    @Query('availableDate') availableDate?: string,
    @Query('style') style?: WeddingStyle,
    @Query('weddingType') weddingType?: WeddingType,
    @Query('minRating', new ParseFloatPipe({ optional: true }))
    minRating?: number,
    @Query('minCapacity', new ParseIntPipe({ optional: true }))
    minCapacity?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'rating' | 'createdAt' | 'listingName',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    const result = await this.listingService.browseListings({
      service: WeddingService.VENUE,
      minPrice,
      maxPrice,
      availableDate,
      style,
      weddingType,
      minRating,
      minCapacity,
      search,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      limit: limit || 20,
      offset: offset || 0,
    });

    return {
      listings: result.listings.map((listing) =>
        this.listingService.toListingResponseDto(listing),
      ),
      total: result.total,
      page: Math.floor((offset || 0) / (limit || 20)) + 1,
      totalPages: Math.ceil(result.total / (limit || 20)),
    };
  }

  @Get('catering/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all catering listings' })
  @ApiResponse({
    status: 200,
    description: 'All catering listings.',
    type: [ListingResponseDto],
  })
  async getAllCatering() {
    const listings = await this.listingService.getAllByService(
      WeddingService.CATERING,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('photography/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all photography listings' })
  @ApiResponse({
    status: 200,
    description: 'All photography listings.',
    type: [ListingResponseDto],
  })
  async getAllPhotography() {
    const listings = await this.listingService.getAllByService(
      WeddingService.PHOTOGRAPHY,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('decoration/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all decoration listings' })
  @ApiResponse({
    status: 200,
    description: 'All decoration listings.',
    type: [ListingResponseDto],
  })
  async getAllDecoration() {
    const listings = await this.listingService.getAllByService(
      WeddingService.DECORATION,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('music/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all music listings' })
  @ApiResponse({
    status: 200,
    description: 'All music listings.',
    type: [ListingResponseDto],
  })
  async getAllMusic() {
    const listings = await this.listingService.getAllByService(
      WeddingService.MUSIC,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('attire/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all attire listings' })
  @ApiResponse({
    status: 200,
    description: 'All attire listings.',
    type: [ListingResponseDto],
  })
  async getAllAttire() {
    const listings = await this.listingService.getAllByService(
      WeddingService.ATTIRE,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('makeup/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all makeup listings' })
  @ApiResponse({
    status: 200,
    description: 'All makeup listings.',
    type: [ListingResponseDto],
  })
  async getAllMakeup() {
    const listings = await this.listingService.getAllByService(
      WeddingService.MAKEUP,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('transportation/all')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all transportation listings' })
  @ApiResponse({
    status: 200,
    description: 'All transportation listings.',
    type: [ListingResponseDto],
  })
  async getAllTransportation() {
    const listings = await this.listingService.getAllByService(
      WeddingService.TRANSPORTATION,
    );
    return listings.map((listing) =>
      this.listingService.toListingResponseDto(listing),
    );
  }

  @Get('browse')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Browse listings with comprehensive filtering' })
  @ApiResponse({
    status: 200,
    description: 'Filtered listings with pagination.',
    schema: {
      type: 'object',
      properties: {
        listings: {
          type: 'array',
          items: { $ref: '#/components/schemas/ListingResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async browseListings(
    @Query('service') service?: WeddingService,
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
    @Query('availableDate') availableDate?: string,
    @Query('style') style?: WeddingStyle,
    @Query('weddingType') weddingType?: WeddingType,
    @Query('minRating', new ParseFloatPipe({ optional: true }))
    minRating?: number,
    @Query('minCapacity', new ParseIntPipe({ optional: true }))
    minCapacity?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'rating' | 'createdAt' | 'listingName',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    const result = await this.listingService.browseListings({
      service,
      minPrice,
      maxPrice,
      availableDate,
      style,
      weddingType,
      minRating,
      minCapacity,
      search,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      limit: limit || 20,
      offset: offset || 0,
    });

    return {
      listings: result.listings.map((listing) =>
        this.listingService.toListingResponseDto(listing),
      ),
      total: result.total,
      page: Math.floor((offset || 0) / (limit || 20)) + 1,
      totalPages: Math.ceil(result.total / (limit || 20)),
    };
  }

  @Get('search/advanced')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Advanced search listings with enhanced text search',
  })
  @ApiResponse({
    status: 200,
    description: 'Advanced search results with pagination.',
    schema: {
      type: 'object',
      properties: {
        listings: {
          type: 'array',
          items: { $ref: '#/components/schemas/ListingResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async searchListingsAdvanced(
    @Query('search') search: string,
    @Query('service') service?: WeddingService,
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
    @Query('availableDate') availableDate?: string,
    @Query('style') style?: WeddingStyle,
    @Query('weddingType') weddingType?: WeddingType,
    @Query('minRating', new ParseFloatPipe({ optional: true }))
    minRating?: number,
    @Query('minCapacity', new ParseIntPipe({ optional: true }))
    minCapacity?: number,
    @Query('sortBy') sortBy?: 'price' | 'rating' | 'createdAt' | 'listingName',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    const result = await this.listingService.searchListingsAdvanced({
      search,
      service,
      minPrice,
      maxPrice,
      availableDate,
      style,
      weddingType,
      minRating,
      minCapacity,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      limit: limit || 20,
      offset: offset || 0,
    });

    return {
      listings: result.listings.map((listing) =>
        this.listingService.toListingResponseDto(listing),
      ),
      total: result.total,
      page: Math.floor((offset || 0) / (limit || 20)) + 1,
      totalPages: Math.ceil(result.total / (limit || 20)),
    };
  }

  @Get('vendor/:vendorId/cheapest')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get cheapest listing for a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Cheapest listing for the vendor.',
    type: ListingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor or listings not found.' })
  async getCheapestListingForVendor(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ) {
    const listing =
      await this.listingService.getCheapestListingForVendor(vendorId);
    return this.listingService.toListingResponseDto(listing);
  }
}
