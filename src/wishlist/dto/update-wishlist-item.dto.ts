import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class UpdateWishlistItemDto {
  @ApiProperty({
    description: 'Title of the wishlist item',
    required: false,
    example: 'Kitchen Mixer',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'URL of the wishlist item',
    required: false,
    example: 'https://example.com/product/kitchen-mixer',
  })
  @IsUrl()
  @IsOptional()
  itemUrl?: string;

  @ApiProperty({
    description: 'Whether the item is reserved',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isReserved?: boolean;
}
