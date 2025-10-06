import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum EmailTone {
  FORMAL = 'formal',
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
}

export class GenerateAiEmailTemplateDto {
  @ApiProperty({
    description: 'The purpose of the email (e.g., "welcome email", "event invitation", "thank you note")',
    example: 'wedding invitation',
  })
  @IsString()
  emailPurpose: string;

  @ApiPropertyOptional({
    description: 'Recipient name for personalization',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Main content or message for the email',
    example: 'You are cordially invited to our wedding celebration',
  })
  @IsString()
  @IsOptional()
  mainMessage?: string;

  @ApiPropertyOptional({
    description: 'Primary color in hex format (e.g., "#ff5a5f", "#3498db")',
    example: '#ff5a5f',
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Secondary color in hex format (e.g., "#45292f", "#2c3e50")',
    example: '#45292f',
  })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional({
    description: 'Tone of the email',
    enum: EmailTone,
    example: EmailTone.FRIENDLY,
  })
  @IsEnum(EmailTone)
  @IsOptional()
  tone?: EmailTone;

  @ApiPropertyOptional({
    description: 'Text for the call-to-action button',
    example: 'RSVP Now',
  })
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiPropertyOptional({
    description: 'URL for the call-to-action button',
    example: 'https://knotly.app/rsvp',
  })
  @IsString()
  @IsOptional()
  buttonUrl?: string;

  @ApiPropertyOptional({
    description: 'Brand name to use in the template',
    example: 'Knotly',
    default: 'Knotly',
  })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiPropertyOptional({
    description: 'Additional context or special requirements for the email',
    example: 'Include a section about dress code and venue details',
  })
  @IsString()
  @IsOptional()
  additionalContext?: string;
}
