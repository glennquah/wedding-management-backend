import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ListingResponseDto } from './dto/listing-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';

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
}
