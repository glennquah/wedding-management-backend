import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional review comment',
    required: false,
    example: 'Great service! Highly recommend.',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Order ID',
    example: 1,
  })
  @IsInt()
  orderId: number;

  @ApiProperty({
    description: 'Listing ID',
    example: 1,
  })
  @IsInt()
  listingId: number;

  @ApiProperty({
    description: 'Vendor ID',
    example: 1,
  })
  @IsInt()
  vendorId: number;
}
