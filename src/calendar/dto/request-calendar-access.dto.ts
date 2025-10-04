import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class RequestCalendarAccessDto {
  @ApiProperty({
    description: 'The ID of the attendee (admin or guest) to request calendar access from',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  attendeeId: number;

  @ApiProperty({
    description: 'The ID of the wedding',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({
    description: 'Whether the attendee is an admin (true) or guest (false)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
