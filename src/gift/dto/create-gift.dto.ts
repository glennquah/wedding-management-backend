import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateGiftDto {
  @ApiProperty({ description: 'The name of the guest who gave the gift' })
  @IsString()
  guestName: string;

  @ApiProperty({ description: 'The amount of the gift', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'The ID of the wedding this gift belongs to' })
  @IsInt()
  weddingId: number;
}
