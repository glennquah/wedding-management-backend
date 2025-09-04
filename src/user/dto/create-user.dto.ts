import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the user account' })
  @IsString()
  password: string;

  @ApiProperty({ 
    description: 'Role of the user', 
    enum: ['user', 'admin', 'vendor'], 
    default: 'user' 
  })
  @IsOptional()
  @IsEnum(['user', 'admin', 'vendor'])
  role?: 'user' | 'admin' | 'vendor';
}
