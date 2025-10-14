import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FastApiRecommendationService } from './fastapi-recommendation.service';
import { VendorRecommendationRequestDto } from './dto/vendor-recommendation-request.dto';
import { VendorRecommendationResponseDto } from './dto/vendor-recommendation-response.dto';

@ApiTags('vendor-recommendation')
@Controller('vendor-recommendation')
export class VendorRecommendationController {
  constructor(
    private readonly fastApiRecommendationService: FastApiRecommendationService,
  ) {}

  @Post('recommend')
  @ApiOperation({
    summary: 'Get vendor recommendations for a wedding',
    description: `
      Generate vendor recommendations using a hybrid recommendation algorithm that combines:
      - Cluster Popularity (α=0.25): Vendors popular among similar weddings
      - Neighbor-Weighted Collaborative Filtering (β=0.5): Vendors chosen by similar users
      - Content-Based Similarity (γ=0.25): Vendors matching wedding preferences

      Returns top-k vendors ranked by combined score with detailed score breakdowns.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor recommendations generated successfully',
    type: VendorRecommendationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or FastAPI service error',
  })
  @ApiResponse({
    status: 404,
    description: 'Wedding not found',
  })
  async getVendorRecommendations(
    @Body() request: VendorRecommendationRequestDto,
  ): Promise<VendorRecommendationResponseDto> {
    return this.fastApiRecommendationService.getVendorRecommendations(request);
  }
}
