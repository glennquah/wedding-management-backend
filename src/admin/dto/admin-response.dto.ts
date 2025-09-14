import { ApiProperty } from '@nestjs/swagger';
import { WeddingDetailsDto } from 'src/wedding/dto/wedding-details.dto';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AdminResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'Is the admin a couple?',
    required: false,
    default: true,
  })
  isCouple?: boolean;

  @ApiProperty({
    description: 'Date when the admin was onboarded',
    required: true,
  })
  onboardedDate: Date;

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    required: true,
  })
  weddingType: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    required: true,
  })
  budgetBucket: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    required: true,
  })
  guestCountBucket: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    required: true,
  })
  preferredStyle: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    isArray: true,
    required: true,
  })
  preferredServices: WeddingService[];

  @ApiProperty({
    description: 'List of weddings associated with the admin',
    type: [WeddingDetailsDto],
    required: false,
  })
  weddings?: WeddingDetailsDto[];
}
