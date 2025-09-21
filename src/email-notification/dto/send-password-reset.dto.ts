import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl, IsOptional } from 'class-validator';

export class SendPasswordResetDto {
  @ApiProperty({
    description: 'Email address to send the password reset email to',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Password reset link URL',
    example: 'https://knotly.app/reset-password?token=abc123',
  })
  @IsUrl()
  resetLink: string;

  @ApiProperty({
    description: 'Name of the recipient',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}