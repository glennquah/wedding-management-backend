import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The name of the login user' })
  @IsString()
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'The password of the login user' })
  @IsString()
  password: string;
}
