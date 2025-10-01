import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class AvailabilityCheckDto {
  @ApiProperty({
    description: 'Array of collaborator IDs to check availability for',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsInt({ each: true })
  @IsNotEmpty()
  collaboratorIds: number[];

  @ApiProperty({
    description: 'Start date for availability check (ISO 8601 format)',
    example: '2025-05-01T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date for availability check (ISO 8601 format)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class AttendeeAvailability {
  @ApiProperty({
    description: 'The collaborator ID',
    example: 1,
  })
  collaboratorId: number;

  @ApiProperty({
    description: 'The collaborator name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Whether calendar is connected',
    example: true,
  })
  isConnected: boolean;

  @ApiProperty({
    description: 'List of busy time slots',
    example: [
      {
        start: '2025-06-14T09:00:00Z',
        end: '2025-06-14T17:00:00Z',
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        start: { type: 'string' },
        end: { type: 'string' },
      },
    },
  })
  busySlots: Array<{ start: string; end: string }>;
}

export class AvailabilityCheckResponseDto {
  @ApiProperty({
    description: 'Availability data for each attendee',
    type: [AttendeeAvailability],
  })
  attendees: AttendeeAvailability[];
}
