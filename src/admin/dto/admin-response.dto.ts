import { ApiProperty } from '@nestjs/swagger';
import { WeddingDetailsDto } from 'src/wedding/dto/wedding-details.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AdminResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'Is the admin suspended?',
    required: false,
    default: false,
  })
  isSuspended?: boolean;

  @ApiProperty({
    description: 'Is the admin registered from dating app platform?',
    required: false,
    default: false,
  })
  isDatingPartnerRegistered?: boolean;

  @ApiProperty({
    description: 'Date when the admin was onboarded',
    required: true,
  })
  onboardedDate: Date;

  @ApiProperty({
    description: 'List of weddings associated with the admin',
    type: [WeddingDetailsDto],
    required: false,
  })
  weddings?: WeddingDetailsDto[];
}
