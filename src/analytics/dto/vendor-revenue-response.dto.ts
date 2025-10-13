import { ApiProperty } from '@nestjs/swagger';

export class VendorRevenueResponseDto {
  @ApiProperty({ description: 'Month-to-date revenue' })
  mtd: number;

  @ApiProperty({ description: 'Year-to-date revenue' })
  ytd: number;

  @ApiProperty({ description: 'All-time revenue' })
  allTime: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;
}
