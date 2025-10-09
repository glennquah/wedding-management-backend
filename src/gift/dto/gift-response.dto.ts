import { ApiProperty } from '@nestjs/swagger';

export class GiftResponseDto {
  @ApiProperty({ description: 'The ID of the gift' })
  id: number;

  @ApiProperty({ description: 'The name of the guest who gave the gift' })
  guestName: string;

  @ApiProperty({ description: 'The amount of the gift' })
  amount: number;

  @ApiProperty({ description: 'The ID of the wedding this gift belongs to' })
  weddingId: number;

  @ApiProperty({ description: 'The creation date of the gift record' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the gift record' })
  updatedAt: Date;
}
