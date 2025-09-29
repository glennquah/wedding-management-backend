import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmGuestDto {
  @ApiProperty({ description: 'Guest ID to confirm' })
  @IsNumber()
  @IsNotEmpty()
  guestId: number;

  @ApiProperty({ description: 'Wedding ID to confirm guest for' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({
    description: 'Food allergies to store for the guest',
    required: false,
    example: 'Peanuts, Shellfish',
  })
  @IsString()
  @IsOptional()
  allergies?: string;
}
