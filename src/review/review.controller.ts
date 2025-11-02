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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/user-role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtGuard, RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'The review has been successfully created.',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order listing not found.' })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: { user: JwtPayload },
  ): Promise<ReviewResponseDto> {
    return this.reviewService.create(createReviewDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({
    status: 200,
    description: 'List of all reviews.',
    type: [ReviewResponseDto],
  })
  async findAll(): Promise<ReviewResponseDto[]> {
    return this.reviewService.findAll();
  }

  @Get('vendor/:vendorId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get reviews by vendor ID' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews for the vendor.',
    type: [ReviewResponseDto],
  })
  async findByVendor(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewService.findByVendor(vendorId);
  }

  @Get('admin/:adminId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get reviews by admin ID' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews created by the admin.',
    type: [ReviewResponseDto],
  })
  async findByAdmin(
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewService.findByAdmin(adminId);
  }

  @Get('order/:orderId/listing/:listingId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get review by order and listing ID' })
  @ApiResponse({
    status: 200,
    description: 'The review has been found.',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findByOrderListing(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<ReviewResponseDto | null> {
    return this.reviewService.findByOrderListing(orderId, listingId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({
    status: 200,
    description: 'The review has been found.',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({
    status: 200,
    description: 'The review has been successfully updated.',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: { user: JwtPayload },
  ): Promise<ReviewResponseDto> {
    return this.reviewService.update(id, updateReviewDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({
    status: 200,
    description: 'The review has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    return this.reviewService.remove(id, req.user.sub);
  }
}
