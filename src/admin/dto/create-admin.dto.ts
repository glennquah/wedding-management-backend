import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
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
  @IsDateString()
  onboardedDate: string;

  @ApiProperty({
    description: 'Wedding type',
    enum: ['chinese', 'malay', 'indian', 'western', 'others'],
    required: true,
  })
  @IsEnum(['chinese', 'malay', 'indian', 'western', 'others'])
  weddingType: 'chinese' | 'malay' | 'indian' | 'western' | 'others';

  @ApiProperty({
    description: 'Budget bucket',
    enum: ['low', 'medium', 'high', 'luxury'],
    required: true,
  })
  @IsEnum(['low', 'medium', 'high', 'luxury'])
  budgetBucket: 'low' | 'medium' | 'high' | 'luxury';

  @ApiProperty({
    description: 'Guest count bucket',
    enum: ['small', 'medium', 'large'],
    required: true,
  })
  @IsEnum(['small', 'medium', 'large'])
  guestCountBucket: 'small' | 'medium' | 'large';

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: ['luxury', 'modern', 'traditional', 'rustic'],
    required: true,
  })
  @IsEnum(['luxury', 'modern', 'traditional', 'rustic'])
  preferredStyle: 'luxury' | 'modern' | 'traditional' | 'rustic';

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
    required: true,
  })
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
  preferredServices: (
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