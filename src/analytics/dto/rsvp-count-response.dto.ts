import { ApiProperty } from '@nestjs/swagger';

export class RsvpCountResponseDto {
  @ApiProperty({
    description: 'Total number of guests invited',
    example: 150,
  })
  totalInvited: number;

  @ApiProperty({
    description: 'Number of guests who confirmed attendance',
    example: 120,
  })
  confirmed: number;

  @ApiProperty({
    description: 'Number of guests pending RSVP',
    example: 30,
  })
  pending: number;

  @ApiProperty({
    description: 'Percentage of guests who have RSVPed',
    example: 80,
  })
  rsvpPercentage: number;
}
