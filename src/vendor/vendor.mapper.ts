import { Vendor } from '@prisma/client';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { toUserResponseDto } from '../user/user.mapper';

export function toVendorResponseDto(vendor: Vendor): VendorResponseDto {
  const userResponse = toUserResponseDto(vendor);
  return {
    ...userResponse,
    vendorWebsite: vendor.vendorWebsite,
    uenNumber: vendor.uenNumber,
    onboardedDate: vendor.onboardedDate,
  };
}
