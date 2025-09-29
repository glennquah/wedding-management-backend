import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @ApiProperty({ description: 'Cart ID' })
  id: number;

  @ApiProperty({ description: 'Admin ID associated with this cart' })
  adminId: number;

  @ApiProperty({ description: 'Total price amount of items in the cart' })
  total: number;

  @ApiProperty({
    description: 'List of items in the cart',
    type: [CartItemResponseDto],
    required: false,
  })
  items: CartItemResponseDto[];
}
