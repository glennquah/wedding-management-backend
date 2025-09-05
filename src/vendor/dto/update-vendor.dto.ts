import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

export class UpdateVendorDto extends UpdateUserDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  @IsOptional()
  @IsString()
  vendorWebsite?: string;

  @ApiProperty({ description: 'Unique Entity Number (UEN) of the vendor', required: false })
  @IsOptional()
  @IsString()
  uenNumber?: string;

  @ApiProperty({ description: 'Date when the vendor was onboarded', required: false })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;

  @ApiProperty({ description: 'Short biography of the vendor', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Rating of the vendor', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
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
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'venue',
    'catering',
    'photography',
    'decoration',
    'music',
    'attire',
    'makeup',
    'transportation',
  ])
  serviceOffered?:
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
    required: false,
  })
  @IsOptional()
  @IsEnum(['luxury', 'modern', 'traditional', 'rustic'])
  styleOffered?: 'luxury' | 'modern' | 'traditional' | 'rustic';

  @ApiProperty({
    description: 'Wedding type specialization of the vendor',
    enum: ['chinese', 'malay', 'indian', 'western', 'others'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(['chinese', 'malay', 'indian', 'western', 'others'], { each: true })
  weddingTypes?: ('chinese' | 'malay' | 'indian' | 'western' | 'others')[];

  @ApiProperty({
    description: 'Capacity the vendor can handle for venue',
    required: false,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}