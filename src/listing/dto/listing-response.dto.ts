import { ApiProperty } from '@nestjs/swagger';
import { AvailabilitySlotDto } from './create-listing.dto';

export class ListingResponseDto {
  @ApiProperty({ description: 'Listing ID' })
  id: number;

  @ApiProperty({ description: 'The name of the listing' })
  listingName: string;

  @ApiProperty({ description: 'Price of the listing' })
  price: number;

  @ApiProperty({
    description: 'Available time slots for the listing',
    type: [AvailabilitySlotDto],
    example: [
      {
        startTime: '2025-01-15T08:00:00Z',
        endTime: '2025-01-15T17:00:00Z',
        date: '2025-01-15',
      },
    ],
  })
  availabilities: AvailabilitySlotDto[];

  @ApiProperty({ description: 'Additional remarks about the listing' })
  remarks: string;

  @ApiProperty({ description: 'Vendor ID linked to this listing' })
  vendorId: number;

  @ApiProperty({
    description: 'Array of image URLs for the listing',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  imageUrls: string[];

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
