import { ApiProperty } from '@nestjs/swagger';

export class EmailTemplateResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Welcome Email Template' })
  name: string;

  @ApiProperty({ example: 'Welcome to our platform!' })
  subject: string;

  @ApiProperty({ example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>' })
  htmlContent: string;

  @ApiProperty({
    example: 'Welcome! Thank you for joining us.',
    required: false,
  })
  textContent?: string;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  notificationDetailsId: number;
}
