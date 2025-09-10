import { ApiProperty } from '@nestjs/swagger';
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
    required: true,
  })
  serviceOffered: WeddingService;

  @ApiProperty({
    description: 'Wedding style specialization of the vendor',
    enum: WeddingStyle,
    required: true,
  })
  styleOffered: WeddingStyle;

  @ApiProperty({
    description: 'Wedding type specialization of the vendor',
    enum: WeddingType,
    isArray: true,
    required: true,
  })
  weddingTypes: WeddingType[];

  @ApiProperty({
    description: 'Capacity the vendor can handle for venue',
    required: false,
    default: null,
  })
  capacity?: number;
}
