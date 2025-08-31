import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateTestUserDto {
  @ApiProperty({ description: 'The name of the test user' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the test user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the test user' })
  @IsString()
  password: string;
}
