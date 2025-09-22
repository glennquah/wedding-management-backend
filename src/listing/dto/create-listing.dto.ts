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

export class AvailabilitySlotDto {
  @ApiProperty({
    description: 'Start time of the availability slot',
    example: '2025-01-15T08:00:00Z'
  })
  @IsISO8601()
  startTime: string;

  @ApiProperty({
    description: 'End time of the availability slot',
    example: '2025-01-15T17:00:00Z'
  })
  @IsISO8601()
  endTime: string;

  @ApiProperty({
    description: 'Date for easier querying (optional)',
    example: '2025-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreateListingDto {
  @ApiProperty({ description: 'The name of the listing' })
  @IsString()
  listingName: string;

  @ApiProperty({ description: 'Price of the listing' })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Available time slots for the listing',
    type: [AvailabilitySlotDto],
    example: [
      {
        startTime: '2025-01-15T08:00:00Z',
        endTime: '2025-01-15T17:00:00Z',
        date: '2025-01-15'
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilities: AvailabilitySlotDto[];

  @ApiProperty({ description: 'Additional remarks about the listing' })
  @IsString()
  remarks: string;

  @ApiProperty({ description: 'Vendor ID linked to this listing' })
  @IsNumber()
  vendorId: number;

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
