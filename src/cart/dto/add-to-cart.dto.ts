import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'Admin ID to associate with this cart',
    required: true,
  })
  @IsInt()
  adminId: number;

  @ApiProperty({
    description: 'Listing ID to add to this cart',
    required: true,
  })
  @IsInt()
  listingId: number;
}
