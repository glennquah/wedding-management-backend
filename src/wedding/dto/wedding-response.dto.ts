import { ApiProperty } from '@nestjs/swagger';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { GuestResponseDto } from '../../guest/dto/guest-response.dto';

export class WeddingResponseDto {
  @ApiProperty({ description: 'Wedding ID' })
  id: number;

  @ApiProperty({ description: 'The name of the wedding' })
  name: string;

  @ApiProperty({ description: 'Wedding date' })
  date?: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  location?: string;

  @ApiProperty({
    description: 'List of guests for this wedding',
    type: [GuestResponseDto],
    required: false,
  })
  guests?: GuestResponseDto[];

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    enumName: 'WeddingType',
  })
  weddingType: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    enumName: 'BudgetBucket',
  })
  budgetBucket: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    enumName: 'GuestCountBucket',
  })
  guestCountBucket: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    enumName: 'WeddingStyle',
  })
  preferredStyle: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    enumName: 'WeddingService',
    isArray: true,
  })
  preferredServices: WeddingService[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}
