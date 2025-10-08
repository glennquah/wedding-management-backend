import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/dto/jwt-payload.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import { VendorOnboardingStatus } from 'src/common/vendor-onboarding-status.enum';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';

import { VendorService } from './vendor.service';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtGuard, RolesGuard)
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
  @ApiResponse({
    status: 409,
    description: 'Vendor with this email already exists.',
  })
  async create(@Body() body: CreateVendorDto): Promise<VendorResponseDto> {
    return this.service.create(body);
  }

  @Post('bulk')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create multiple vendors' })
  @ApiResponse({
    status: 201,
    description: 'The vendors have been successfully created.',
    type: [VendorResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createMultiple(
    @Body() body: CreateVendorDto[],
  ): Promise<VendorResponseDto[]> {
    return this.service.createMultiple(body);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({
    status: 200,
    description: 'List of all vendors',
    type: [VendorResponseDto],
  })
  async getAllVendors(): Promise<VendorResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({
    status: 200,
    description: 'The vendor details',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async getVendor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.findById(id);
  }

  @Get('email/:email')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a vendor by email' })
  @ApiResponse({
    status: 200,
    description: 'The vendor details',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async getVendorByEmail(
    @Param('email') email: string,
  ): Promise<VendorResponseDto> {
    return this.service.findByEmail(email);
  }

  @Put(':id')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been successfully updated.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 409,
    description: 'Vendor with this email already exists.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    return this.service.update(id, body);
  }

  @Delete('delete-self')
  @Roles(UserRole.VENDOR)
  @ApiOperation({
    summary: 'Delete own vendor profile (requires password confirmation)',
  })
  @ApiResponse({
    status: 200,
    description: 'The vendor profile has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Invalid password.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'mypassword123' },
      },
      required: ['password'],
    },
  })
  async deleteSelf(
    @Request() req: Request & { user: JwtPayload },
    @Body() body: { password: string },
  ): Promise<void> {
    await this.service.deleteSelf(req.user.sub, body.password);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Delete a vendor (super admin only, no password required)',
  })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Vendor successfully deleted' };
  }

  @Put(':id/accept')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Accept vendor onboarding' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been marked as onboarded.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async onboardVendor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.update(id, {
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    });
  }

  @Put(':id/reject')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Reject vendor onboarding' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been marked as rejected.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async rejectVendor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.update(id, {
      onboardingStatus: VendorOnboardingStatus.REJECTED,
    });
  }

  @Put(':id/suspend')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Suspend vendor' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been marked as suspended.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async suspendVendor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.update(id, {
      isSuspended: true,
    });
  }

  @Put(':id/unsuspend')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Unsuspend vendor' })
  @ApiResponse({
    status: 200,
    description: 'The vendor has been marked as unsuspended.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async unsuspendVendor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.update(id, {
      isSuspended: false,
    });
  }

  // Business Certificate endpoints
  @Post(':id/business-certificate')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Add business certificate image URL' })
  @ApiResponse({
    status: 200,
    description: 'Business certificate URL added successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/cert.jpg' },
      },
      required: ['imageUrl'],
    },
  })
  async addBusinessCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.addBusinessCertificate(id, body.imageUrl);
  }

  @Put(':id/business-certificate')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update business certificate image URL' })
  @ApiResponse({
    status: 200,
    description: 'Business certificate URL updated successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/cert.jpg' },
      },
      required: ['imageUrl'],
    },
  })
  async updateBusinessCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.updateBusinessCertificate(id, body.imageUrl);
  }

  @Delete(':id/business-certificate')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete business certificate image URL' })
  @ApiResponse({
    status: 200,
    description: 'Business certificate URL deleted successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async deleteBusinessCertificate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.deleteBusinessCertificate(id);
  }

  // Rating Screenshot endpoints
  @Post(':id/rating-screenshot')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Add rating screenshot image URL' })
  @ApiResponse({
    status: 200,
    description: 'Rating screenshot URL added successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://example.com/rating.jpg',
        },
      },
      required: ['imageUrl'],
    },
  })
  async addRatingScreenshot(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.addRatingScreenshot(id, body.imageUrl);
  }

  @Put(':id/rating-screenshot')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update rating screenshot image URL' })
  @ApiResponse({
    status: 200,
    description: 'Rating screenshot URL updated successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://example.com/rating.jpg',
        },
      },
      required: ['imageUrl'],
    },
  })
  async updateRatingScreenshot(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.updateRatingScreenshot(id, body.imageUrl);
  }

  @Delete(':id/rating-screenshot')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete rating screenshot image URL' })
  @ApiResponse({
    status: 200,
    description: 'Rating screenshot URL deleted successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async deleteRatingScreenshot(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.deleteRatingScreenshot(id);
  }

  // Identity Document endpoints
  @Post(':id/identity-document')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Add identity document image URL' })
  @ApiResponse({
    status: 200,
    description: 'Identity document URL added successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/id.jpg' },
      },
      required: ['imageUrl'],
    },
  })
  async addIdentityDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.addIdentityDocument(id, body.imageUrl);
  }

  @Put(':id/identity-document')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update identity document image URL' })
  @ApiResponse({
    status: 200,
    description: 'Identity document URL updated successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/id.jpg' },
      },
      required: ['imageUrl'],
    },
  })
  async updateIdentityDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string },
  ): Promise<VendorResponseDto> {
    return this.service.updateIdentityDocument(id, body.imageUrl);
  }

  @Delete(':id/identity-document')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete identity document image URL' })
  @ApiResponse({
    status: 200,
    description: 'Identity document URL deleted successfully.',
    type: VendorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async deleteIdentityDocument(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VendorResponseDto> {
    return this.service.deleteIdentityDocument(id);
  }
}
