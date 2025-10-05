import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class VendorRecommendationRequestDto {
  @ApiProperty({
    description: 'Wedding ID to get recommendations for',
    example: 1,
  })
  @IsInt()
  wedding_id: number;

  @ApiProperty({
    description: 'Number of top vendors to recommend',
    minimum: 1,
    maximum: 50,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  top_k?: number = 10;
}
