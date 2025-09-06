import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

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
    description: 'Date when the admin was onboarded',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: ['chinese', 'malay', 'indian', 'western', 'others'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['chinese', 'malay', 'indian', 'western', 'others'])
  weddingType?: 'chinese' | 'malay' | 'indian' | 'western' | 'others';

  @ApiProperty({
    description: 'Budget bucket',
    enum: ['low', 'medium', 'high', 'luxury'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'luxury'])
  budgetBucket?: 'low' | 'medium' | 'high' | 'luxury';

  @ApiProperty({
    description: 'Guest count bucket',
    enum: ['small', 'medium', 'large'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  guestCountBucket?: 'small' | 'medium' | 'large';

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: ['luxury', 'modern', 'traditional', 'rustic'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['luxury', 'modern', 'traditional', 'rustic'])
  preferredStyle?: 'luxury' | 'modern' | 'traditional' | 'rustic';

  @ApiProperty({
    description: 'Preferred wedding services',
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
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(
    [
      'venue',
      'catering',
      'photography',
      'decoration',
      'music',
      'attire',
      'makeup',
      'transportation',
    ],
    { each: true }
  )
  preferredServices?: (
    | 'venue'
    | 'catering'
    | 'photography'
    | 'decoration'
    | 'music'
    | 'attire'
    | 'makeup'
    | 'transportation'
    )[];
}