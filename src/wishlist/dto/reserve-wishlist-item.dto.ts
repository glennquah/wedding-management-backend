import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReserveWishlistItemDto {
  @ApiProperty({
    description: 'Whether to reserve or unreserve the item',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isReserved: boolean;

  @ApiProperty({
    description: 'Name of the person reserving the item',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  reservedByName?: string;
}
