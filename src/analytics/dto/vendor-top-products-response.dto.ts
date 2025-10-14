import { ApiProperty } from '@nestjs/swagger';

export class TopProductData {
  @ApiProperty({ description: 'Listing ID' })
  listingId: number;

  @ApiProperty({ description: 'Listing name' })
  listingName: string;

  @ApiProperty({ description: 'Total revenue from this listing' })
  revenue: number;

  @ApiProperty({ description: 'Total number of bookings' })
  bookingCount: number;

  @ApiProperty({ description: 'Listing price' })
  price: number;
}

export class VendorTopProductsResponseDto {
  @ApiProperty({ description: 'Top selling products', type: [TopProductData] })
  topProducts: TopProductData[];

  @ApiProperty({ description: 'Currency code' })
  currency: string;
}
