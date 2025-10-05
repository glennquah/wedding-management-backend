import { ApiProperty } from '@nestjs/swagger';

export class VendorScoreDto {
  @ApiProperty({ description: 'Vendor user ID', example: 123 })
  vendor_id: number;

  @ApiProperty({ description: 'Final weighted score', example: 0.85 })
  final_score: number;

  @ApiProperty({
    description: 'Score based on vendor popularity in user cluster',
    example: 0.3,
  })
  cluster_popularity_score: number;

  @ApiProperty({
    description: 'Score based on similar users vendor choices',
    example: 0.45,
  })
  neighbor_score: number;

  @ApiProperty({
    description: 'Score based on feature compatibility with user preferences',
    example: 0.1,
  })
  content_similarity_score: number;
}

export class VendorRecommendationResponseDto {
  @ApiProperty({ description: 'Whether recommendation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'Cluster the wedding belongs to',
    example: 3,
    required: false,
  })
  cluster_id?: number;

  @ApiProperty({
    description: 'List of recommended vendors with scores',
    type: [VendorScoreDto],
    required: false,
  })
  recommendations?: VendorScoreDto[];
}
