import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class VendorResponseDto extends UserResponseDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  vendorWebsite?: string;

  @ApiProperty({ description: 'Unique Entity Number (UEN) of the vendor', required: false })
  uenNumber?: string;

  @ApiProperty({ description: 'Date when the vendor was onboarded', required: true })
  onboardedDate: Date;

  @ApiProperty({ description: 'Short biography of the vendor', required: false })
  bio?: string;

  @ApiProperty({ description: 'Rating of the vendor', required: false, default: 0 })
  rating?: number;

  @ApiProperty({
    description: 'Service offered by the vendor',
    enum: [
      'venue',
      'catering',
      'photography',
      'decoration',
      'music',
      'attire',
      'makeup',
      'transportation',
    ],
    required: true,
  })
  serviceOffered:
    | 'venue'
    | 'catering'
    | 'photography'
    | 'decoration'
    | 'music'
    | 'attire'
    | 'makeup'
    | 'transportation';

  @ApiProperty({
    description: 'Wedding style specialization of the vendor',
    enum: ['luxury', 'modern', 'traditional', 'rustic'],
    required: true,
  })
  styleOffered: 'luxury' | 'modern' | 'traditional' | 'rustic';

  @ApiProperty({
    description: 'Wedding type specialization of the vendor',
    enum: ['chinese', 'malay', 'indian', 'western', 'others'],
    isArray: true,
    required: true,
  })
  weddingTypes: ('chinese' | 'malay' | 'indian' | 'western' | 'others')[];

  @ApiProperty({
    description: 'Capacity the vendor can handle for venue',
    required: false,
    default: null,
  })
  capacity?: number;
}
