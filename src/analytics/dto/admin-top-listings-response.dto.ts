import { ApiProperty } from '@nestjs/swagger';

export class TopListingData {
  @ApiProperty({ description: 'Listing ID' })
  listingId: number;

  @ApiProperty({ description: 'Listing name' })
  listingName: string;

  @ApiProperty({ description: 'Vendor ID' })
  vendorId: number;

  @ApiProperty({ description: 'Vendor name' })
  vendorName: string;

  @ApiProperty({ description: 'Service category', required: false })
  serviceOffered?: string;

  @ApiProperty({ description: 'Total revenue generated' })
  revenue: number;

  @ApiProperty({ description: 'Number of bookings' })
  bookingCount: number;

  @ApiProperty({ description: 'Listing price' })
  price: number;
}

export class AdminTopListingsResponseDto {
  @ApiProperty({
    description: 'Top listings by revenue',
    type: [TopListingData],
  })
  topListings: TopListingData[];

  @ApiProperty({ description: 'Currency code', default: 'SGD' })
  currency: string;
}
