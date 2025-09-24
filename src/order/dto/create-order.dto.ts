import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderListingDto {
  @ApiProperty({ description: 'Listing ID to include in the order' })
  @IsInt()
  listingId: number;

  @ApiProperty({
    description: 'Array of booked dates for this listing',
    type: [String],
    example: ['2024-12-15', '2024-12-16'],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  bookedDates: string[];
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Wedding ID this order belongs to' })
  @IsInt()
  weddingId: number;

  @ApiProperty({
    description: 'Array of listings with their booked dates',
    type: [OrderListingDto],
    example: [
      { listingId: 1, bookedDates: ['2024-12-15'] },
      { listingId: 2, bookedDates: ['2024-12-15', '2024-12-16'] },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderListingDto)
  listings: OrderListingDto[];

  @ApiProperty({
    description: 'Additional remarks about the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}
