import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from '../common/user-role.enum';

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
