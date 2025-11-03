import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDatingUserDto {
  @ApiProperty({
    description: 'Email of the dating platform user being registered',
    example: 'guest@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Name of the dating platform user being registered',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
