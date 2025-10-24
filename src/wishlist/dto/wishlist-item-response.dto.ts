import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemResponseDto {
  @ApiProperty({ description: 'Wishlist item ID' })
  id: number;

  @ApiProperty({ description: 'Title of the wishlist item' })
  title: string;

  @ApiProperty({ description: 'URL of the wishlist item' })
  itemUrl: string;

  @ApiProperty({ description: 'Whether the item is reserved' })
  isReserved: boolean;

  @ApiProperty({
    description: 'Name of the person who reserved the item',
    required: false,
  })
  reservedByName?: string;

  @ApiProperty({ description: 'Wedding ID' })
  weddingId: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
