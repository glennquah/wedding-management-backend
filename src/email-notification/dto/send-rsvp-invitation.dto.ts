import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SendRsvpInvitationDto {
  @ApiProperty({
    description: 'The ID of the guest to send the RSVP invitation to',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  guestId: number;

  @ApiProperty({
    description: 'The ID of the wedding',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
