import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BudgetBucket } from '../../common/budget-bucket.enum';
import { GuestCountBucket } from '../../common/guest-count-bucket.enum';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';

export class UpdateWeddingDto {
  @ApiProperty({ description: 'The name of the wedding', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Wedding date', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: WeddingType,
    enumName: 'WeddingType',
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingType)
  weddingType?: WeddingType;

  @ApiProperty({
    description: 'Budget bucket',
    enum: BudgetBucket,
    enumName: 'BudgetBucket',
    required: false,
  })
  @IsOptional()
  @IsEnum(BudgetBucket)
  budgetBucket?: BudgetBucket;

  @ApiProperty({
    description: 'Guest count bucket',
    enum: GuestCountBucket,
    enumName: 'GuestCountBucket',
    required: false,
  })
  @IsOptional()
  @IsEnum(GuestCountBucket)
  guestCountBucket?: GuestCountBucket;

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: WeddingStyle,
    enumName: 'WeddingStyle',
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingStyle)
  preferredStyle?: WeddingStyle;

  @ApiProperty({
    description: 'Preferred wedding services',
    enum: WeddingService,
    enumName: 'WeddingService',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(WeddingService, { each: true })
  preferredServices?: WeddingService[];
}
