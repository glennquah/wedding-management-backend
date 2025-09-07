import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/user-role.enum';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ 
    description: 'Role of the user', 
    enum: UserRole, 
  })
  role: UserRole;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
