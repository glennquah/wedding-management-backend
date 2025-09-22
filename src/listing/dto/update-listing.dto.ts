import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
  IsOptional,
  IsUrl,
  ValidateNested,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilitySlotDto } from './create-listing.dto';

export class UpdateListingDto {
  @ApiProperty({ description: 'The name of the listing', required: false })
  @IsOptional()
  @IsString()
  listingName?: string;

  @ApiProperty({ description: 'Price of the listing', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Available time slots for the listing',
    type: [AvailabilitySlotDto],
    required: false,
    example: [
      {
        startTime: '2025-01-15T08:00:00Z',
        endTime: '2025-01-15T17:00:00Z',
        date: '2025-01-15'
      }
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilities?: AvailabilitySlotDto[];

  @ApiProperty({
    description: 'Additional remarks about the listing',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'Array of image URLs for the listing',
    type: [String],
    required: false,
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];
}
