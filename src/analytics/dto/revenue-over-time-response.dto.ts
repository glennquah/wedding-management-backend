import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueData {
  @ApiProperty({ description: 'Month in YYYY-MM format' })
  month: string;

  @ApiProperty({ description: 'Revenue for the month' })
  revenue: number;

  @ApiProperty({ description: 'Number of orders in the month' })
  orderCount: number;
}

export class RevenueOverTimeResponseDto {
  @ApiProperty({
    description: 'Monthly revenue data',
    type: [MonthlyRevenueData],
  })
  monthlyData: MonthlyRevenueData[];

  @ApiProperty({ description: 'Currency code' })
  currency: string;
}
