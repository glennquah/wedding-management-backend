import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../common/user-role.enum';

export class CreateSuperAdminDto {
  @ApiProperty({ description: 'The name of the super admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address of the super admin' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the super admin account',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRole,
    enumName: 'UserRole',
    required: true,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
