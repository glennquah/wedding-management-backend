import { ApiProperty } from '@nestjs/swagger';

export class GuestCountResponseDto {
  @ApiProperty({
    description: 'Total number of guests for the wedding',
    example: 150,
  })
  totalGuests: number;

  @ApiProperty({
    description: 'Number of primary guests (guests without primaryGuestId)',
    example: 100,
  })
  primaryGuests: number;

  @ApiProperty({
    description: 'Number of accompanying guests',
    example: 50,
  })
  accompanyingGuests: number;
}
