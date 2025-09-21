import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';

export class SendSingleEmailDto {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Your Subject' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Plain text message' })
  @IsString()
  text: string;

  @ApiProperty({ example: '<p>HTML message</p>' })
  @IsString()
  html: string;

  @ApiProperty({ example: 123, required: false })
  @IsNumber()
  @IsOptional()
  weddingId?: number;
}
