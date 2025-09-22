import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateType } from '@prisma/client';

class WeddingInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John & Jane Wedding' })
  name: string;

  @ApiProperty({ example: '2024-06-15T15:00:00Z', required: false })
  date?: Date;

  @ApiProperty({ example: 'Grand Ballroom, City Hotel', required: false })
  location?: string;
}

class NotificationDetailsDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: WeddingInfoDto, required: false })
  wedding?: WeddingInfoDto;
}

export class EmailNotificationHistoryWithWeddingDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: ['user@example.com', 'user2@example.com'] })
  to: string[];

  @ApiProperty({ example: 'Welcome to our platform!' })
  subject: string;

  @ApiProperty({ example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>' })
  body: string;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  sentAt: Date;

  @ApiProperty({ enum: EmailTemplateType, example: EmailTemplateType.WELCOME })
  type: EmailTemplateType;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  notificationDetailsId: number;

  @ApiProperty({ type: NotificationDetailsDto })
  notificationDetails: NotificationDetailsDto;
}
