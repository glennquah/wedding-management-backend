import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

export class UpdateAdminDto extends UpdateUserDto {
  @ApiProperty({
    description: 'Is the admin suspended?',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @ApiProperty({
    description: 'Date when the admin was onboarded',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;

  @ApiProperty({
    description: 'Wedding ID to associate with this admin',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weddingId?: number;
}
