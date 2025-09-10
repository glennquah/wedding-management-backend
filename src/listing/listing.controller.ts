import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('listings')
@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  // In a real app, vendorId would come from auth token/user context
  private mockVendorId = 1;

  @Post()
  async create(@Body() dto: CreateListingDto) {
    return this.listingService.create(this.mockVendorId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingService.update(this.mockVendorId, id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.listingService.delete(this.mockVendorId, id);
  }

  @Get('search')
  async search(@Query('listingName') listingName: string) {
    return this.listingService.searchByName(this.mockVendorId, listingName);
  }
}
