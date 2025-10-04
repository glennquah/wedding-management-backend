import { ApiProperty } from '@nestjs/swagger';

export class AlbumResponseDto {
  @ApiProperty({ description: 'Album ID' })
  id: number;

  @ApiProperty({ description: 'Couple name' })
  coupleName: string;

  @ApiProperty({ description: 'Custom invite card message' })
  inviteCardMessage: string;

  @ApiProperty({ description: 'Custom landing message in album' })
  landingMessage: string;

  @ApiProperty({ description: 'Cloudinary album URL', required: false })
  albumURL?: string;
}
