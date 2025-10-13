import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class InvitePartnerDto {
  @ApiProperty({
    description:
      'Guest ID to invite as partner (optional if email and name provided)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  guestId?: number;

  @ApiProperty({
    description: 'Email of the partner being invited',
    example: 'partner@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Name of the partner being invited',
    example: 'Jane Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Wedding ID to add as partner to main couple',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  weddingId: number;
}
