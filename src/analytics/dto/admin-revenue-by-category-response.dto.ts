import { ApiProperty } from '@nestjs/swagger';

export class CategoryRevenueData {
  @ApiProperty({ description: 'Wedding service category' })
  category: string;

  @ApiProperty({ description: 'Total revenue for this category' })
  revenue: number;

  @ApiProperty({ description: 'Number of bookings in this category' })
  bookingCount: number;

  @ApiProperty({
    description: 'Percentage of total revenue',
  })
  percentageOfTotal: number;
}

export class AdminRevenueByCategoryResponseDto {
  @ApiProperty({
    description: 'Revenue breakdown by category',
    type: [CategoryRevenueData],
  })
  categories: CategoryRevenueData[];

  @ApiProperty({ description: 'Total revenue across all categories' })
  totalRevenue: number;

  @ApiProperty({ description: 'Currency code', default: 'SGD' })
  currency: string;
}
