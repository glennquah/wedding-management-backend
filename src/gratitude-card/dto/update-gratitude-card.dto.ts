import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateGratitudeCardDto {
  @ApiProperty({
    description: 'Wedding ID to associate with the gratitude cards',
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({
    description: 'Card recipient',
  })
  @IsString()
  recipient: string;

  @ApiProperty({
    description: 'Couple sign off name for the cards',
  })
  @IsString()
  signOffName: string;

  @ApiProperty({ description: 'Custom guest card message', required: false })
  @IsString()
  @IsOptional()
  guestCardMessage?: string;

  @ApiProperty({
    description: 'Custom collaborator card message',
    required: false,
  })
  @IsString()
  @IsOptional()
  collaboratorCardMessage?: string;

  @ApiProperty({ description: 'Custom vendor card message', required: false })
  @IsString()
  @IsOptional()
  vendorCardMessage?: string;

  @ApiProperty({ description: 'Guest card main photo URL', required: false })
  @IsString()
  @IsOptional()
  guestCardPhotoURL?: string;

  @ApiProperty({
    description: 'Collaborator card main photo URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  collaboratorCardPhotoURL?: string;
}
