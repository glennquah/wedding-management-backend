import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ description: 'Cart Item ID' })
  id: number;

  @ApiProperty({ description: 'Listing ID associated with this Cart Item' })
  listingId: number;

  @ApiProperty({ description: 'Listing name' })
  listingName: string;

  @ApiProperty({ description: 'Total price of cart item' })
  price: number;

  @ApiProperty({ description: 'Cart item display image URL' })
  imageUrls: string[];
}
