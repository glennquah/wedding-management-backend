import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'The name of the email template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The subject of the email template' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'The HTML content of the email template' })
  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @ApiProperty({
    description: 'The plain text content of the email template',
    required: false,
  })
  @IsString()
  @IsOptional()
  textContent?: string;
}
