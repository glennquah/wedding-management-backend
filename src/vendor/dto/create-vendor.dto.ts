import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WeddingService } from '../../common/wedding-service.enum';
import { WeddingStyle } from '../../common/wedding-style.enum';
import { WeddingType } from '../../common/wedding-type.enum';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateVendorDto extends CreateUserDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  @IsOptional()
  @IsString()
  vendorWebsite?: string;

  @ApiProperty({
    description: 'Unique Entity Number (UEN) of the vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  uenNumber?: string;

  @ApiProperty({
    description: 'Date when the vendor was onboarded',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;

  @ApiProperty({
    description: 'Short biography of the vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Rating of the vendor',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({
    description: 'Service offered by the vendor',
    enum: WeddingService,
    required: true,
  })
  @IsEnum(WeddingService)
  serviceOffered: WeddingService;

  @ApiProperty({
    description: 'Wedding style specialization of the vendor',
    enum: WeddingStyle,
    required: true,
  })
  @IsEnum(WeddingStyle)
  styleOffered: WeddingStyle;

  @ApiProperty({
    description: 'Wedding type specialization of the vendor',
    enum: WeddingType,
    isArray: true,
    required: true,
  })
  @IsEnum(WeddingType, { each: true })
  weddingTypes: WeddingType[];

  @ApiProperty({
    description: 'Capacity the vendor can handle for venue',
    required: false,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}
