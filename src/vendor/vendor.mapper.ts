import { Vendor, User } from '@prisma/client';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { toUserResponseDto } from '../user/user.mapper';

export function toVendorResponseDto(vendor: Vendor & { user: User }): VendorResponseDto {
  const userResponse = toUserResponseDto(vendor.user);
  return {
    ...userResponse,
    vendorWebsite: vendor.vendorWebsite,
    uenNumber: vendor.uenNumber,
    onboardedDate: vendor.onboardedDate,
    bio: vendor.bio,    
    rating: vendor.rating,
    serviceOffered: vendor.serviceOffered,
    styleOffered: vendor.styleOffered,
    weddingTypes: vendor.weddingTypes,
    capacity: vendor.capacity,
  };
}
