import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGratitudeCardDto {
  @ApiProperty({
    description: 'Wedding ID to associate with the gratitude cards',
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({ description: 'Couple sign off name across gratitude cards' })
  @IsString()
  @IsNotEmpty()
  signOffName: string;

  @ApiProperty({ description: 'Custom guest card message' })
  @IsString()
  @IsNotEmpty()
  guestCardMessage: string;

  @ApiProperty({ description: 'Guest card main photo URL' })
  @IsString()
  @IsNotEmpty()
  guestCardPhotoURL: string;
}
