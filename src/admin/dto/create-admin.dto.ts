import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { CreateUserDto } from '../../user/dto/create-user.dto';

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
  @IsNotEmpty()
  @IsDateString()
  onboardedDate: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    enumName: "WeddingType",
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(WeddingType)
  weddingType: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    enumName: "BudgetBucket",
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(BudgetBucket)
  budgetBucket: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    enumName: "GuestCountBucket",
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(GuestCountBucket)
  guestCountBucket: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    enumName: "WeddingStyle",
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(WeddingStyle)
  preferredStyle: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    enumName: "WeddingService",
    isArray: true,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(WeddingService, { each: true })
  preferredServices: WeddingService[];
}
