import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailTemplateType } from '@prisma/client';

export class AllEmailNotificationHistoryResponseDto {
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

  @ApiPropertyOptional({ example: 'Vendor Name' })
  vendorName?: string;

  @ApiPropertyOptional({ example: 'Wedding Name' })
  weddingName?: string;
}
