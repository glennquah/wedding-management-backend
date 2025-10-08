import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

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

  @ApiProperty({ description: 'Custom invite card message', required: false })
  @IsString()
  @IsOptional()
  inviteCardMessage?: string;

  @ApiProperty({
    description: 'Custom landing message in album',
    required: false,
  })
  @IsString()
  @IsOptional()
  landingMessage?: string;

  @ApiProperty({ description: 'Cloudinary album URL', required: false })
  @IsString()
  @IsOptional()
  albumURL?: string;

  @ApiProperty({
    description: 'Array of Cloudinary image URLs for the photo gallery',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({
    description: 'Uploaded photo cloudinary URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
