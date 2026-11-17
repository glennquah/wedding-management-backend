import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ScheduleItemDto, FaqItemDto } from './create-microsite.dto';

export class UpdateMicrositeDto {
  @ApiProperty({
    description: 'Template number for the microsite',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  templateNumber?: number;

  @ApiProperty({
    description: 'Unique slug for the microsite URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Couple name for the microsite',
    required: false,
  })
  @IsString()
  @IsOptional()
  coupleName?: string;

  @ApiProperty({
    description: 'Hero images URLs',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  heroImages?: string[];

  @ApiProperty({
    description: 'Image gallery URLs',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageGallery?: string[];

  @ApiProperty({
    description: 'Wedding schedule (stored as JSON)',
    required: false,
    type: [ScheduleItemDto],
  })
  @IsOptional()
  schedule?: ScheduleItemDto[];

  @ApiProperty({
    description: 'Frequently asked questions (stored as JSON)',
    required: false,
    type: [FaqItemDto],
  })
  @IsOptional()
  faqs?: FaqItemDto[];

  @ApiProperty({
    description: 'Password to access microsite',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
