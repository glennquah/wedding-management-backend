import { ApiProperty } from '@nestjs/swagger';

export class CashGiftResponseDto {
  @ApiProperty({ description: 'The ID of the cash gift' })
  id: number;

  @ApiProperty({ description: 'The ID of the guest who gave the cash gift' })
  guestId: number;

  @ApiProperty({ description: 'The name of the guest who gave the cash gift' })
  guestName: string;

  @ApiProperty({ description: 'The amount of the cash gift' })
  amount: number;

  @ApiProperty({
    description: 'The ID of the wedding this cash gift belongs to',
  })
  weddingId: number;

  @ApiProperty({ description: 'The creation date of the cash gift record' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the cash gift record' })
  updatedAt: Date;
}
