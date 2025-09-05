import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum } from 'class-validator';

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
    enum: ['admin', 'superAdmin', 'vendor'], 
    required: true
  })
  @IsEnum(['admin', 'superAdmin', 'vendor'])
  role: 'admin' | 'superAdmin' | 'vendor';
}
