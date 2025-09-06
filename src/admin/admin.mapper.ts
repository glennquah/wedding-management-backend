import { Admin, User } from '@prisma/client';
import { AdminResponseDto } from './dto/admin-response.dto';
import { toUserResponseDto } from '../user/user.mapper';

export function toAdminResponseDto(admin: Admin & { user: User }): AdminResponseDto {
  const userResponse = toUserResponseDto(admin.user);
  return {
    ...userResponse,
    isCouple: admin.isCouple,
    onboardedDate: admin.onboardedDate,
    weddingType: admin.weddingType,
    budgetBucket: admin.budgetBucket,
    guestCountBucket: admin.guestCountBucket,
    preferredStyle: admin.preferredStyle,
    preferredServices: admin.preferredServices,
  };
}
