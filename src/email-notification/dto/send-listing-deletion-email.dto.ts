import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendVendorListingDeletionDto {
  @ApiProperty({
    description: 'The unique ID of the vendor (maps to userId).',
    example: 1,
  })
  @IsNumber()
  vendorId: number;

  @ApiProperty({
    description: 'The name of the listing that was deleted.',
    example: 'Elegant Garden Venue',
  })
  @IsString()
  @IsNotEmpty()
  listingName: string;

  @ApiProperty({
    description: 'The date of removal, preferably in ISO format.',
    example: '2025-11-08',
  })
  @IsString()
  @IsNotEmpty()
  dateRemoved: string;

  @ApiProperty({
    description: 'The reason for the listing removal.',
    example: 'The listing violated our terms of service.',
  })
  @IsString()
  @IsNotEmpty()
  reasonForRemoval: string;
}
