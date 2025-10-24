import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReserveWishlistItemDto {
  @ApiProperty({
    description: 'Whether to reserve or unreserve the item',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isReserved: boolean;
}
