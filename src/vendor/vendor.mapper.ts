import { Vendor, User } from '@prisma/client';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { toUserResponseDto } from '../user/user.mapper';
import { WeddingStyle } from '../common/wedding-style.enum';
import { WeddingService } from '../common/wedding-service.enum';
import { WeddingType } from '../common/wedding-type.enum';

export function toVendorResponseDto(vendor: Vendor & { user: User }): VendorResponseDto {
  const userResponse = toUserResponseDto(vendor.user);
  return {
    ...userResponse,
    vendorWebsite: vendor.vendorWebsite,
    uenNumber: vendor.uenNumber,
    onboardedDate: vendor.onboardedDate,
    bio: vendor.bio,    
    rating: vendor.rating,
    serviceOffered: vendor.serviceOffered as WeddingService,
    styleOffered: vendor.styleOffered as WeddingStyle,
    weddingTypes: vendor.weddingTypes as WeddingType[],
    capacity: vendor.capacity,
  };
}
