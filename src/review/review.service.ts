import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus } from '../common/order-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(
    createReviewDto: CreateReviewDto,
    adminId: number,
  ): Promise<ReviewResponseDto> {
    const { orderId, listingId, vendorId, rating, comment } = createReviewDto;

    // Verify the order listing exists and belongs to the admin
    const orderListing = await this.prisma.orderListing.findUnique({
      where: {
        orderId_listingId: {
          orderId,
          listingId,
        },
      },
      include: {
        order: {
          include: {
            wedding: {
              include: {
                mainCouple: true,
              },
            },
          },
        },
        listing: true,
      },
    });

    if (!orderListing) {
      throw new NotFoundException(
        `Order listing with orderId ${orderId} and listingId ${listingId} not found`,
      );
    }

    // Verify the admin is part of the wedding's main couple
    const isMainCouple = orderListing.order.wedding.mainCouple.some(
      (admin) => admin.userId === adminId,
    );

    if (!isMainCouple) {
      throw new ForbiddenException(
        'You are not authorized to review this order',
      );
    }

    // Verify the order listing is completed
    if (orderListing.bookingStatus !== OrderStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed orders');
    }

    // Verify the listing belongs to the vendor
    if (orderListing.listing.vendorId !== vendorId) {
      throw new BadRequestException(
        'The listing does not belong to the specified vendor',
      );
    }

    // Check if a review already exists for this order listing
    const existingReview = await this.prisma.review.findUnique({
      where: {
        orderId_listingId: {
          orderId,
          listingId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'A review already exists for this order listing',
      );
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        rating,
        comment,
        orderId,
        listingId,
        vendorId,
        adminId,
      },
    });

    // Update vendor's average rating
    await this.updateVendorAverageRating(vendorId);

    return review;
  }

  async findAll(): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      include: {
        orderListing: {
          include: {
            order: {
              include: {
                wedding: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => {
      const wedding = review.orderListing?.order?.wedding;
      const weddingCouple = wedding?.name;

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        orderId: review.orderId,
        listingId: review.listingId,
        vendorId: review.vendorId,
        adminId: review.adminId,
        weddingCouple,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });
  }

  async findByVendor(vendorId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        vendorId,
      },
      include: {
        orderListing: {
          include: {
            order: {
              include: {
                wedding: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => {
      const wedding = review.orderListing?.order?.wedding;
      const weddingCouple = wedding?.name;

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        orderId: review.orderId,
        listingId: review.listingId,
        vendorId: review.vendorId,
        adminId: review.adminId,
        weddingCouple,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });
  }

  async findByAdmin(adminId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        adminId,
      },
      include: {
        orderListing: {
          include: {
            order: {
              include: {
                wedding: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => {
      const wedding = review.orderListing?.order?.wedding;
      const weddingCouple = wedding?.name;

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        orderId: review.orderId,
        listingId: review.listingId,
        vendorId: review.vendorId,
        adminId: review.adminId,
        weddingCouple,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });
  }

  async findOne(id: number): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        orderListing: {
          include: {
            order: {
              include: {
                wedding: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    const wedding = review.orderListing?.order?.wedding;
    const weddingCouple = wedding?.name;

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      orderId: review.orderId,
      listingId: review.listingId,
      vendorId: review.vendorId,
      adminId: review.adminId,
      weddingCouple,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async findByOrderListing(
    orderId: number,
    listingId: number,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        orderId_listingId: {
          orderId,
          listingId,
        },
      },
      include: {
        orderListing: {
          include: {
            order: {
              include: {
                wedding: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return null;
    }

    const wedding = review.orderListing?.order?.wedding;
    const weddingCouple = wedding?.name;

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      orderId: review.orderId,
      listingId: review.listingId,
      vendorId: review.vendorId,
      adminId: review.adminId,
      weddingCouple,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    adminId: number,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Verify the review belongs to the admin
    if (review.adminId !== adminId) {
      throw new ForbiddenException(
        'You are not authorized to update this review',
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });

    // Update vendor's average rating if rating changed
    if (updateReviewDto.rating !== undefined) {
      await this.updateVendorAverageRating(review.vendorId);
    }

    return updatedReview;
  }

  async remove(id: number, adminId: number): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Verify the review belongs to the admin
    if (review.adminId !== adminId) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }

    const vendorId = review.vendorId;

    await this.prisma.review.delete({
      where: { id },
    });

    // Update vendor's average rating
    await this.updateVendorAverageRating(vendorId);
  }

  private async updateVendorAverageRating(vendorId: number): Promise<void> {
    const reviews = await this.prisma.review.findMany({
      where: { vendorId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    await this.prisma.vendor.update({
      where: { userId: vendorId },
      data: { rating: averageRating },
    });
  }
}
