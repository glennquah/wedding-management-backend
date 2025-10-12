import { ApiProperty } from '@nestjs/swagger';
import { RevenuePeriod } from '../../common/revenue-period.enum';

export class RevenueDataPoint {
  @ApiProperty({
    description:
      'Period label (YYYY-MM-DD for daily breakdown, YYYY-MM for monthly breakdown)',
  })
  period: string;

  @ApiProperty({ description: 'Revenue for the period' })
  revenue: number;

  @ApiProperty({ description: 'Number of orders in the period' })
  orderCount: number;
}

export class RevenueOverTimeResponseDto {
  @ApiProperty({
    description: 'Revenue data points over time',
    type: [RevenueDataPoint],
  })
  data: RevenueDataPoint[];

  @ApiProperty({
    description: 'Period type',
    enum: RevenuePeriod,
  })
  periodType: RevenuePeriod;

  @ApiProperty({ description: 'Currency code' })
  currency: string;
}
