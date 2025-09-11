import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateListingDto {
  @ApiProperty({ description: 'The name of the listing' })
  @IsString()
  listingName: string;

  @ApiProperty({ description: 'Price of the listing' })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Available dates for the listing',
    type: [String],
    example: ['2025-09-10', '2025-09-12'],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  availabilities: string[];

  @ApiProperty({ description: 'Additional remarks about the listing' })
  @IsString()
  remarks: string;

  @ApiProperty({ description: 'Vendor ID linked to this listing' })
  @IsNumber()
  vendorId: number;
}
