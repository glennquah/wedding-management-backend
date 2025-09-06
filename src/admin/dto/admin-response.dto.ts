import { ApiProperty } from '@nestjs/swagger';
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
    enum: ['chinese', 'malay', 'indian', 'western', 'others'],
    required: true,
  })
  weddingType: 'chinese' | 'malay' | 'indian' | 'western' | 'others';

  @ApiProperty({
    description: 'Budget bucket',
    enum: ['low', 'medium', 'high', 'luxury'],
    required: true,
  })
  budgetBucket: 'low' | 'medium' | 'high' | 'luxury';

  @ApiProperty({
    description: 'Guest count bucket',
    enum: ['small', 'medium', 'large'],
    required: true,
  })
  guestCountBucket: 'small' | 'medium' | 'large';

  @ApiProperty({
    description: 'Preferred wedding style',
    enum: ['luxury', 'modern', 'traditional', 'rustic'],
    required: true,
  })
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
