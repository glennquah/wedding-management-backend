import { ApiProperty } from '@nestjs/swagger';
import { GuestResponseDto } from '../../guest/dto/guest-response.dto';

export class WeddingResponseDto {
  @ApiProperty({ description: 'Wedding ID' })
  id: number;

  @ApiProperty({ description: 'The name of the wedding' })
  name: string;

  @ApiProperty({ description: 'Wedding date' })
  date: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  location?: string;

  @ApiProperty({
    description: 'List of guests for this wedding',
    type: [GuestResponseDto],
    required: false,
  })
  guests?: GuestResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}
