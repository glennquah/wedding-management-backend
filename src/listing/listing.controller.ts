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

  @Post()
  async create(@Body() dto: CreateListingDto) {
    return this.listingService.create(dto.vendorId, dto);
  }

  @Patch(':vendorId/:id')
  async update(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingService.update(vendorId, id, dto);
  }

  @Delete(':vendorId/:id')
  async delete(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.listingService.delete(vendorId, id);
  }

  @Get(':vendorId/search')
  async search(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query('listingName') listingName: string,
  ) {
    return this.listingService.searchByName(vendorId, listingName);
  }
}
