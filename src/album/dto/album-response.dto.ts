import { ApiProperty } from '@nestjs/swagger';

export class AlbumResponseDto {
  @ApiProperty({ description: 'Album ID' })
  id: number;

  @ApiProperty({ description: 'Associated wedding ID' })
  weddingId: number;

  @ApiProperty({ description: 'Couple name' })
  coupleName: string;

  @ApiProperty({ description: 'Custom invite card message' })
  inviteCardMessage: string;

  @ApiProperty({ description: 'Custom landing message in album' })
  landingMessage: string;

  @ApiProperty({ description: 'Cloudinary album URL', required: false })
  albumURL?: string;

  @ApiProperty({
    description: 'Array of Cloudinary image URLs for the photo gallery',
    required: false,
    type: [String],
  })
  photos?: string[];
}
