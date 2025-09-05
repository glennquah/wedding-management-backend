import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Password for the user account', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ 
    description: 'Role of the user', 
    enum: ['admin', 'superAdmin', 'vendor'], 
    required: true
  })
  @IsOptional()
  @IsEnum(['admin', 'superAdmin', 'vendor'])
  role?: 'admin' | 'superAdmin' | 'vendor';
}
