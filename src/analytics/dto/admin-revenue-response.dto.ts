import { ApiProperty } from '@nestjs/swagger';

export class AdminRevenueResponseDto {
  @ApiProperty({ description: 'Month-to-Date revenue' })
  mtd: number;

  @ApiProperty({ description: 'Year-to-Date revenue' })
  ytd: number;

  @ApiProperty({ description: 'All-time revenue' })
  allTime: number;

  @ApiProperty({
    description: 'Average order value (average spent per wedding)',
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Commission earned (10% of total revenue)',
  })
  commissionEarned: number;

  @ApiProperty({ description: 'Currency code', default: 'SGD' })
  currency: string;
}
