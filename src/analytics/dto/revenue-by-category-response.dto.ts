import { ApiProperty } from '@nestjs/swagger';
import { WeddingService } from '../../common/wedding-service.enum';

export class CategoryRevenueData {
  @ApiProperty({
    description: 'Service category',
    enum: WeddingService,
    enumName: 'WeddingService',
  })
  category: WeddingService;

  @ApiProperty({ description: 'Revenue from this category' })
  revenue: number;

  @ApiProperty({ description: 'Percentage of total revenue' })
  percentage: number;

  @ApiProperty({ description: 'Number of bookings in this category' })
  bookingCount: number;
}

export class RevenueByCategoryResponseDto {
  @ApiProperty({
    description: 'Revenue breakdown by category',
    type: [CategoryRevenueData],
  })
  categories: CategoryRevenueData[];

  @ApiProperty({ description: 'Total revenue across all categories' })
  totalRevenue: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;
}
