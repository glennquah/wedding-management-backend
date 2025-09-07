import { Admin, User } from '@prisma/client';
import { AdminResponseDto } from './dto/admin-response.dto';
import { toUserResponseDto } from '../user/user.mapper';
import { WeddingType } from '../common/wedding-type.enum';
import { BudgetBucket } from '../common/budget-bucket.enum';
import { GuestCountBucket } from '../common/guest-count-bucket.enum';
import { WeddingStyle } from '../common/wedding-style.enum';
import { WeddingService } from '../common/wedding-service.enum';

export function toAdminResponseDto(admin: Admin & { user: User }): AdminResponseDto {
  const userResponse = toUserResponseDto(admin.user);
  return {
    ...userResponse,
    isCouple: admin.isCouple,
    onboardedDate: admin.onboardedDate,
    weddingType: admin.weddingType as WeddingType,
    budgetBucket: admin.budgetBucket as BudgetBucket,
    guestCountBucket: admin.guestCountBucket as GuestCountBucket,
    preferredStyle: admin.preferredStyle as WeddingStyle,
    preferredServices: admin.preferredServices as WeddingService[],
  };
}