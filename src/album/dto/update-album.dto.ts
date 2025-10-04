import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateAlbumDto {
  @ApiProperty({ description: 'Wedding ID to associate with the microsite' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({
    description: 'Couple name for the album',
    required: false,
  })
  @IsString()
  @IsOptional()
  coupleName?: string;

  @ApiProperty({ description: 'Custom invite card message' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  inviteCardMessage?: string;

  @ApiProperty({ description: 'Custom landing message in album' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  landingMessage?: string;

  @ApiProperty({ description: 'Cloudinary album URL' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  albumURL?: string;
}
