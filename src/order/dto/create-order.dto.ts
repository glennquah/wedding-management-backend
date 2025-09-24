import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BookedSlotDto {
  @ApiProperty({ description: 'Start time of the booked slot' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time of the booked slot' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'Date for easier querying (optional)' })
  @IsOptional()
  @IsString()
  date?: string;
}

export class OrderListingDto {
  @ApiProperty({ description: 'Listing ID to include in the order' })
  @IsInt()
  listingId: number;

  @ApiProperty({
    description: 'Array of booked availability slots for this listing',
    type: [BookedSlotDto],
    example: [
      {
        startTime: '2024-12-15T08:00:00Z',
        endTime: '2024-12-15T17:00:00Z',
        date: '2024-12-15',
      },
      {
        startTime: '2024-12-16T08:00:00Z',
        endTime: '2024-12-16T17:00:00Z',
        date: '2024-12-16',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookedSlotDto)
  bookedSlots: BookedSlotDto[];
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Wedding ID this order belongs to' })
  @IsInt()
  weddingId: number;

  @ApiProperty({
    description: 'Array of listings with their booked dates',
    type: [OrderListingDto],
    example: [
      {
        listingId: 1,
        bookedSlots: [
          {
            startTime: '2024-12-15T08:00:00Z',
            endTime: '2024-12-15T17:00:00Z',
            date: '2024-12-15',
          },
        ],
      },
      {
        listingId: 2,
        bookedSlots: [
          {
            startTime: '2024-12-15T08:00:00Z',
            endTime: '2024-12-15T17:00:00Z',
            date: '2024-12-15',
          },
          {
            startTime: '2024-12-16T08:00:00Z',
            endTime: '2024-12-16T17:00:00Z',
            date: '2024-12-16',
          },
        ],
      },
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
