import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ example: 123 })
  @IsNumber()
  @IsOptional()
  weddingId?: number;

  @ApiProperty({ example: 456 })
  @IsNumber()
  @IsOptional()
  vendorId?: number;
}
