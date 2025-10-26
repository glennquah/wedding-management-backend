import { ApiProperty } from '@nestjs/swagger';

export class BookingDataPoint {
  @ApiProperty({ description: 'Time period (YYYY-MM-DD or YYYY-MM)' })
  period: string;

  @ApiProperty({ description: 'Number of bookings in this period' })
  bookingCount: number;

  @ApiProperty({ description: 'Revenue in this period' })
  revenue: number;
}

export class AdminBookingsOverTimeResponseDto {
  @ApiProperty({
    description: 'Bookings data over time',
    type: [BookingDataPoint],
  })
  data: BookingDataPoint[];

  @ApiProperty({
    description: 'Period type (MONTHLY, YEARLY, ALL)',
  })
  periodType: string;

  @ApiProperty({ description: 'Currency code', default: 'SGD' })
  currency: string;
}
