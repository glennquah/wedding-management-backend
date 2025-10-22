import { ApiProperty } from '@nestjs/swagger';

export class WeddingDateData {
  @ApiProperty({ description: 'Wedding date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Number of weddings on this date' })
  count: number;
}

export class AdminWeddingDatesHeatmapResponseDto {
  @ApiProperty({
    description: 'Wedding dates and their counts',
    type: [WeddingDateData],
  })
  data: WeddingDateData[];

  @ApiProperty({ description: 'Total number of weddings with dates' })
  totalWeddings: number;
}
