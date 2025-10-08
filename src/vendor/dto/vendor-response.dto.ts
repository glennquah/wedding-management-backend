import { ApiProperty } from '@nestjs/swagger';
import { VendorOnboardingStatus } from 'src/common/vendor-onboarding-status.enum';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class VendorResponseDto extends UserResponseDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  vendorWebsite?: string;

  @ApiProperty({
    description: 'Unique Entity Number (UEN) of the vendor',
    required: false,
  })
  uenNumber?: string;

  @ApiProperty({
    description: 'Date when the vendor was onboarded',
    required: true,
  })
  onboardedDate: Date;

  @ApiProperty({
    description: 'Short biography of the vendor',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'Rating of the vendor',
    required: false,
    default: 0,
  })
  rating?: number;

  @ApiProperty({
    description: 'Service offered by the vendor',
    enum: WeddingService,
    enumName: 'WeddingService',
    required: false,
  })
  serviceOffered?: WeddingService;

  @ApiProperty({
    description: 'Wedding style specialization of the vendor',
    enum: WeddingStyle,
    enumName: 'WeddingStyle',
    required: false,
  })
  styleOffered?: WeddingStyle;

  @ApiProperty({
    description: 'Wedding type specialization of the vendor',
    enum: WeddingType,
    enumName: 'WeddingType',
    isArray: true,
    required: false,
  })
  weddingTypes?: WeddingType[];

  @ApiProperty({
    description: 'Capacity the vendor can handle for venue',
    required: false,
    default: null,
  })
  capacity?: number;

  @ApiProperty({
    description: 'Business certificate image URL',
    required: false,
  })
  businessCertificate?: string;

  @ApiProperty({
    description: 'Rating screenshot image URL',
    required: false,
  })
  ratingScreenshot?: string;

  @ApiProperty({
    description: 'Identity document image URL',
    required: false,
  })
  identityDocument?: string;

  @ApiProperty({
    description: 'Onboarding status of the vendor',
    enum: VendorOnboardingStatus,
    enumName: 'VendorOnboardingStatus',
    default: VendorOnboardingStatus.PENDING,
  })
  onboardingStatus: VendorOnboardingStatus;

  @ApiProperty({
    description: 'Is the vendor suspended?',
    required: false,
    default: false,
  })
  isSuspended?: boolean;
}
