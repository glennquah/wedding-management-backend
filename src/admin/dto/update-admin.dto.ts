import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
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
    description: 'Wedding ID to associate with this admin',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weddingId?: number;
}
