import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class CreateWishlistItemDto {
  @ApiProperty({
    description: 'Title of the wishlist item',
    example: 'Kitchen Mixer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'URL of the wishlist item',
    example: 'https://example.com/product/kitchen-mixer',
  })
  @IsUrl()
  @IsNotEmpty()
  itemUrl: string;

  @ApiProperty({
    description: 'Wedding ID to associate with the wishlist item',
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
