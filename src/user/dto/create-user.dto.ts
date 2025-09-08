import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../common/user-role.enum';

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
    enum: UserRole,
    enumName: "UserRole", 
    required: true
  })
  @IsEnum(UserRole)
  role: UserRole;
}
