import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty({ description: 'Wedding ID to associate with the microsite' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({ description: 'Couple name for the album and invite' })
  @IsString()
  @IsNotEmpty()
  coupleName: string;

  @ApiProperty({ description: 'Custom invite card message' })
  @IsString()
  @IsNotEmpty()
  inviteCardMessage: string;

  @ApiProperty({ description: 'Custom landing message in album ' })
  @IsString()
  @IsNotEmpty()
  landingMessage: string;

  @ApiProperty({ description: 'Cloudinary album URL' })
  @IsString()
  @IsNotEmpty()
  albumURL: string;
}
