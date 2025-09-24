import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendBulkEmailDto {
  @ApiProperty({
    type: [String],
    example: ['user1@example.com', 'user2@example.com'],
    description: 'Array of recipient email addresses',
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({ example: 'Your Subject' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Plain text message' })
  @IsString()
  text: string;

  @ApiProperty({ example: '<p>HTML message</p>' })
  @IsString()
  html: string;

  @ApiPropertyOptional({ example: 123 })
  @IsNumber()
  @IsOptional()
  weddingId?: number;
}
