import { ApiProperty } from '@nestjs/swagger';

export class TopVendorData {
  @ApiProperty({ description: 'Vendor user ID' })
  vendorId: number;

  @ApiProperty({ description: 'Vendor name' })
  vendorName: string;

  @ApiProperty({ description: 'Service offered by vendor', required: false })
  serviceOffered?: string;

  @ApiProperty({ description: 'Total revenue generated' })
  revenue: number;

  @ApiProperty({ description: 'Number of bookings' })
  bookingCount: number;

  @ApiProperty({ description: 'Vendor rating', required: false })
  rating?: number;
}

export class AdminTopVendorsResponseDto {
  @ApiProperty({
    description: 'Top vendors by revenue',
    type: [TopVendorData],
  })
  topVendors: TopVendorData[];

  @ApiProperty({ description: 'Currency code', default: 'SGD' })
  currency: string;
}
