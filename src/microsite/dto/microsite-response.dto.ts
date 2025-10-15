import { ApiProperty } from '@nestjs/swagger';

export class ScheduleItemDto {
  @ApiProperty({ description: 'Scheduled time', example: '2:00 PM' })
  time: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Guest Arrival & Registration',
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Doors open and light refreshments served.',
  })
  description: string;
}

export class FaqItemDto {
  @ApiProperty({
    description: 'FAQ question',
    example: 'What is the dress code?',
  })
  q: string;

  @ApiProperty({
    description: 'FAQ answer',
    example: 'Formal attire is appreciated.',
  })
  a: string;
}

export class MicrositeResponseDto {
  @ApiProperty({ description: 'Microsite ID' })
  id: number;

  @ApiProperty({ description: 'Template number' })
  templateNumber: number;

  @ApiProperty({ description: 'Microsite slug' })
  slug: string;

  @ApiProperty({ description: 'Couple name' })
  coupleName: string;

  @ApiProperty({
    description: 'Hero images URLs',
    required: false,
    type: [String],
  })
  heroImages?: string[];

  @ApiProperty({
    description: 'Image gallery URLs',
    required: false,
    type: [String],
  })
  imageGallery?: string[];

  @ApiProperty({
    description: 'Wedding schedule',
    required: false,
    type: [ScheduleItemDto],
  })
  schedule?: ScheduleItemDto[];

  @ApiProperty({
    description: 'Frequently asked questions',
    required: false,
    type: [FaqItemDto],
  })
  faqs?: FaqItemDto[];

  @ApiProperty({ description: 'Wedding ID' })
  weddingId: number;

  @ApiProperty({ description: 'Wedding name' })
  weddingName: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  weddingLocation?: string;

  @ApiProperty({ description: 'Wedding date', required: false })
  weddingDate?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
