import { ApiProperty } from '@nestjs/swagger';

class GuestMinimalDto {
  @ApiProperty({ description: 'Guest ID' })
  id: number;

  @ApiProperty({ description: 'Guest name' })
  name: string;
}

export class WeddingPublicResponseDto {
  @ApiProperty({ description: 'Wedding name' })
  name: string;

  @ApiProperty({ description: 'PayNow QR code URL' })
  paynowQR: string;

  @ApiProperty({
    description: 'List of guests with minimal info',
    type: [GuestMinimalDto],
  })
  guests: GuestMinimalDto[];
}
