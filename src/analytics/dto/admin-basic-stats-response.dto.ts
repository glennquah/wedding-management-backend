import { ApiProperty } from '@nestjs/swagger';

export class AdminBasicStatsResponseDto {
  @ApiProperty({ description: 'Total number of vendors in the system' })
  totalVendors: number;

  @ApiProperty({
    description: 'Total number of couples (admins) in the system',
  })
  totalCouples: number;

  @ApiProperty({ description: 'Total number of weddings hosted' })
  totalWeddings: number;

  @ApiProperty({ description: 'Total number of microsites created' })
  totalMicrosites: number;

  @ApiProperty({
    description: 'Total number of guests served across all weddings',
  })
  totalGuestsServed: number;
}
