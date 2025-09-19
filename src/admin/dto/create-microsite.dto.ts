import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMicrositeDto {
  @ApiProperty({ description: 'Template number for the microsite' })
  @IsNumber()
  @IsNotEmpty()
  templateNumber: number;

  @ApiProperty({ description: 'Unique slug for the microsite URL' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Couple name for the microsite' })
  @IsString()
  @IsNotEmpty()
  coupleName: string;

  @ApiProperty({ description: 'Hero images URLs', required: false })
  @IsString()
  @IsOptional()
  heroImages?: string;

  @ApiProperty({ description: 'Image gallery URLs', required: false })
  @IsString()
  @IsOptional()
  imageGallery?: string;

  @ApiProperty({ description: 'Wedding schedule', required: false })
  @IsOptional()
  schedule?: any[];

  @ApiProperty({ description: 'Frequently asked questions', required: false })
  @IsOptional()
  faqs?: any[];

  @ApiProperty({ description: 'Password to access microsite', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Wedding ID to associate with the microsite' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
