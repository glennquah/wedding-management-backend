import { ApiProperty } from '@nestjs/swagger';

export class EmailTemplateResponse {
  @ApiProperty({
    description: 'Generated HTML email template',
    example: '<!doctype html><html>...</html>',
  })
  html: string;

  @ApiProperty({
    description: 'Suggested email subject line',
    example: 'Welcome to Knotly - Your Wedding Planning Journey Begins!',
  })
  subject: string;
}
