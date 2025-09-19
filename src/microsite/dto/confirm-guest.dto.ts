import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class ConfirmGuestDto {
  @ApiProperty({ description: 'Guest ID to confirm' })
  @IsNumber()
  @IsNotEmpty()
  guestId: number;

  @ApiProperty({ description: 'Wedding ID to confirm guest for' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
