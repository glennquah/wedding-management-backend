import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class UpdateGuestDto {
  @ApiProperty({ description: 'The name of the guest', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Allergies or dietary restrictions', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ description: 'Group identifier for the guest', required: false })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ description: 'Primary guest ID if this is an accompanying guest', required: false })
  @IsOptional()
  @IsInt()
  primaryGuestId?: number;

  @ApiProperty({ 
    description: 'Confirmation status of the guest', 
    enum: ['pending', 'confirmed', 'rejected'], 
    required: false 
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'rejected'])
  confirmationStatus?: 'pending' | 'confirmed' | 'rejected';
}