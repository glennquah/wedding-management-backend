import { ApiProperty } from '@nestjs/swagger';

export class UserGrowthDataPoint {
  @ApiProperty({ description: 'Time period (YYYY-MM-DD or YYYY-MM)' })
  period: string;

  @ApiProperty({ description: 'Number of new vendors in this period' })
  vendorSignups: number;

  @ApiProperty({ description: 'Number of new couples in this period' })
  coupleSignups: number;

  @ApiProperty({ description: 'Total signups (vendors + couples)' })
  totalSignups: number;

  @ApiProperty({ description: 'Cumulative total users up to this period' })
  cumulativeTotal: number;
}

export class AdminUserGrowthResponseDto {
  @ApiProperty({
    description: 'User growth data over time',
    type: [UserGrowthDataPoint],
  })
  data: UserGrowthDataPoint[];

  @ApiProperty({
    description: 'Period type (MONTHLY, YEARLY, ALL)',
  })
  periodType: string;

  @ApiProperty({ description: 'Total vendors currently' })
  totalVendors: number;

  @ApiProperty({ description: 'Total couples currently' })
  totalCouples: number;
}
