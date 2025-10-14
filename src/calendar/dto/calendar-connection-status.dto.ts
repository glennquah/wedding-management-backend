import { ApiProperty } from '@nestjs/swagger';

export enum CalendarAccessStatus {
  NOT_REQUESTED = 'NOT_REQUESTED',
  REQUESTED = 'REQUESTED',
  REJECTED = 'REJECTED',
  CONNECTED = 'CONNECTED',
}

export class CalendarConnectionStatusDto {
  @ApiProperty({
    description: 'Whether the calendar is connected',
    example: true,
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'The calendar access status',
    enum: CalendarAccessStatus,
    example: CalendarAccessStatus.CONNECTED,
  })
  accessStatus: CalendarAccessStatus;

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

  @ApiProperty({
    description: 'The date when access was requested',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  accessRequestedAt?: string;
}
