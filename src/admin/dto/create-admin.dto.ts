import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    description: 'Is the admin a couple?',
    required: true,
    default: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isCouple: boolean;

  @ApiProperty({
    description: 'Wedding ID to associate with this admin',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  weddingId: number;
}
