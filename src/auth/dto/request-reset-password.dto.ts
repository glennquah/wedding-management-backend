import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestResetPasswordDto {
  @ApiProperty({
    description: 'The email address to send reset instructions to',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
