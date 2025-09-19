import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleItemDto {
  @ApiProperty({ description: 'Scheduled time', example: '2:00 PM' })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Guest Arrival & Registration',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Doors open and light refreshments served.',
  })
  @IsString()
  description: string;
}

class FaqItemDto {
  @ApiProperty({
    description: 'FAQ question',
    example: 'What is the dress code?',
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'FAQ answer',
    example: 'Formal attire is appreciated.',
  })
  @IsString()
  a: string;
}

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

  @ApiProperty({
    description: 'Hero images URLs',
    required: false,
    type: [String],
    example: ['/images/landing-pg (1).jpg', '/images/landing-pg (2).jpg'],
  })
  @IsOptional()
  heroImages?: string[];

  @ApiProperty({
    description: 'Image gallery URLs',
    required: false,
    type: [String],
    example: ['/images/gallery1.jpg', '/images/gallery2.jpg'],
  })
  @IsOptional()
  imageGallery?: string[];

  @ApiProperty({
    description: 'Wedding schedule',
    required: false,
    type: [ScheduleItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  @IsOptional()
  schedule?: ScheduleItemDto[];

  @ApiProperty({
    description: 'Frequently asked questions',
    required: false,
    type: [FaqItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  @IsOptional()
  faqs?: FaqItemDto[];

  @ApiProperty({ description: 'Password to access microsite', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Wedding ID to associate with the microsite' })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;
}
