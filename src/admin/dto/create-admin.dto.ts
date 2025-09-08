import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingService } from '../../common/wedding-service.enum';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    description: 'Is the admin a couple?',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isCouple?: boolean;

  @ApiProperty({
    description: 'Date when the admin was onboarded',
    required: true,
  })
  @IsDateString()
  onboardedDate: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    required: true,
  })
  @IsEnum(WeddingType)
  weddingType: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    required: true,
  })
  @IsEnum(BudgetBucket)
  budgetBucket: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    required: true,
  })
  @IsEnum(GuestCountBucket)
  guestCountBucket: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    required: true,
  })
  @IsEnum(WeddingStyle)
  preferredStyle: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    isArray: true,
    required: true,
  })
  @IsEnum(WeddingService, { each: true })
  preferredServices: WeddingService[];
}
