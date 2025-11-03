import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    required: false,
    example: 'Great service! Highly recommend.',
  })
  comment?: string;

  @ApiProperty({ description: 'Order ID', example: 1 })
  orderId: number;

  @ApiProperty({ description: 'Listing ID', example: 1 })
  listingId: number;

  @ApiProperty({ description: 'Vendor ID', example: 1 })
  vendorId: number;

  @ApiProperty({ description: 'Admin ID (reviewer)', example: 1 })
  adminId: number;

  @ApiProperty({
    description: 'Wedding couple names',
    required: false,
    example: 'Sarah & Michael',
  })
  weddingCouple?: string;

  @ApiProperty({ description: 'Review creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Review last update date' })
  updatedAt: Date;
}
