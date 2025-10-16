import { ApiProperty } from '@nestjs/swagger';

export class GratitudeCardResponseDto {
  @ApiProperty({ description: 'Gratitude Card ID' })
  id: number;

  @ApiProperty({ description: 'Associated wedding ID' })
  weddingId: number;

  @ApiProperty({ description: 'Couple sign off name' })
  signOffName: string;

  @ApiProperty({ description: 'Custom guest card message', required: false })
  guestCardMessage?: string;

  @ApiProperty({
    description: 'Custom collaborator card message',
    required: false,
  })
  collaboratorCardMessage?: string;

  @ApiProperty({ description: 'Custom vendor card message', required: false })
  vendorCardMessage?: string;

  @ApiProperty({ description: 'Guest card main photo URL', required: false })
  guestCardPhotoURL?: string;

  @ApiProperty({
    description: 'Collaborator card main photo URL',
    required: false,
  })
  collaboratorCardPhotoURL?: string;
}
