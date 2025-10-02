import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    description: 'Is the admin a couple?',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isCouple?: boolean;

  @ApiProperty({
    description: 'Wedding ID to associate with this admin',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weddingId?: number;
}
