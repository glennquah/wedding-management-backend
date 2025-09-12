import { ApiProperty } from '@nestjs/swagger';

export class ListingResponseDto {
  @ApiProperty({ description: 'Listing ID' })
  id: number;

  @ApiProperty({ description: 'The name of the listing' })
  listingName: string;

  @ApiProperty({ description: 'Price of the listing' })
  price: number;

  @ApiProperty({
    description: 'Available dates for the listing',
    type: [String],
    example: ['2025-09-10', '2025-09-12'],
  })
  availabilities: string[];

  @ApiProperty({ description: 'Additional remarks about the listing' })
  remarks: string;

  @ApiProperty({ description: 'Vendor ID linked to this listing' })
  vendorId: number;

  // If you later want to expose vendor details:
  // @ApiProperty({ description: 'Vendor details', type: () => VendorResponseDto })
  // vendor: VendorResponseDto;

  // Same for orders:
  // @ApiProperty({ description: 'Orders related to this listing', type: [OrderListingResponseDto] })
  // orders: OrderListingResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}
