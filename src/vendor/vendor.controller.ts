import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put,
  ParseIntPipe, 
  UseGuards 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { toVendorResponseDto } from './vendor.mapper';
import { VendorService } from './vendor.service';

@ApiTags('vendors')
@Controller('vendors')
// @UseGuards(JwtGuard) // Temporarily disabled for testing
export class VendorController {
  constructor(private service: VendorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({
    status: 201,
    description: 'The vendor has been successfully created.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Vendor with this email already exists.' })
  async create(@Body() body: CreateVendorDto): Promise<VendorResponseDto> {
    const vendor = await this.service.create(body);
    return toVendorResponseDto(vendor);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple vendors' })
  @ApiResponse({
    status: 201,
    description: 'The vendors have been successfully created.',
    type: [VendorResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createMultiple(@Body() body: CreateVendorDto[]): Promise<VendorResponseDto[]> {
    const vendors = await this.service.createMultiple(body);
    return vendors.map(toVendorResponseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({
    status: 200,
    description: 'List of all vendors',
    type: [VendorResponseDto],
  })
  async getAllVendors(): Promise<VendorResponseDto[]> {
    const vendors = await this.service.findAll();
    return vendors.map(toVendorResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({
    status: 200,
    description: 'The vendor details',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async getVendor(@Param('id', ParseIntPipe) id: number): Promise<VendorResponseDto> {
    const vendor = await this.service.findById(id);
    return toVendorResponseDto(vendor);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a vendor by email' })
  @ApiResponse({
    status: 200,
    description: 'The vendor details',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async getVendorByEmail(@Param('email') email: string): Promise<VendorResponseDto> {
    const vendor = await this.service.findByEmail(email);
    return toVendorResponseDto(vendor);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been successfully updated.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Vendor with this email already exists.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVendorDto
  ): Promise<VendorResponseDto> {
    const vendor = await this.service.update(id, body);
    return toVendorResponseDto(vendor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Vendor successfully deleted' };
  }
}
