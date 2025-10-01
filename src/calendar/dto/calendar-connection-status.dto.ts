import { ApiProperty } from '@nestjs/swagger';

export class CalendarConnectionStatusDto {
  @ApiProperty({
    description: 'Whether the calendar is connected',
    example: true,
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'The email associated with the calendar connection',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'The date when the connection was established',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  connectedAt?: string;
}
