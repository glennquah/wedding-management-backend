import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
  IsOptional,
} from 'class-validator';

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
    description: 'Available dates for the listing',
    type: [String],
    required: false,
    example: ['2025-09-10', '2025-09-12'],
  })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  availabilities?: string[];

  @ApiProperty({
    description: 'Additional remarks about the listing',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'Vendor ID linked to this listing',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  vendorId?: number;
}
