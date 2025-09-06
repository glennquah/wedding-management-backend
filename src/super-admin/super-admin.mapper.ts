import { SuperAdmin, User } from '@prisma/client';
import { SuperAdminResponseDto } from './dto/super-admin-response.dto';
import { toUserResponseDto } from '../user/user.mapper';

export function toSuperAdminResponseDto(superAdmin: SuperAdmin & { user: User }): SuperAdminResponseDto {
  return toUserResponseDto(superAdmin.user);
}
