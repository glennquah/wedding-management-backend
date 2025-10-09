import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class BroadcastRsvpInvitationDto {
  @ApiProperty({
    description: 'The IDs of the guests to send RSVP invitations to',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  guestIds: number[];

  @ApiProperty({
    description: 'The ID of the wedding',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
