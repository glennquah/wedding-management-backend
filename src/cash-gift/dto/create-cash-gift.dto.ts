import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateCashGiftDto {
  @ApiProperty({ description: 'The ID of the guest who gave the cash gift' })
  @IsInt()
  guestId: number;

  @ApiProperty({ description: 'The amount of the cash gift', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'The ID of the wedding this cash gift belongs to',
  })
  @IsInt()
  weddingId: number;
}
