import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingService } from '../../common/wedding-service.enum';

export class UpdateAdminDto extends UpdateUserDto {
  @ApiProperty({
    description: 'Is the admin a couple?',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isCouple?: boolean;

  @ApiProperty({
    description: 'Is the admin suspended?',
    required: false,
    default: false,
  })
  isSuspended?: boolean;

  @ApiProperty({
    description: 'Date when the admin was onboarded',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingType)
  weddingType?: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    required: false,
  })
  @IsOptional()
  @IsEnum(BudgetBucket)
  budgetBucket?: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    required: false,
  })
  @IsOptional()
  @IsEnum(GuestCountBucket)
  guestCountBucket?: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingStyle)
  preferredStyle?: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingService, { each: true })
  preferredServices?: WeddingService[];
}
