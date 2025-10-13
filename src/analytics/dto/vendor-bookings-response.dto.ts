import { ApiProperty } from '@nestjs/swagger';

export class VendorBookingsResponseDto {
  @ApiProperty({ description: 'Total number of bookings' })
  totalBookings: number;

  @ApiProperty({ description: 'Number of pending bookings' })
  pendingBookings: number;

  @ApiProperty({ description: 'Number of confirmed bookings' })
  confirmedBookings: number;

  @ApiProperty({ description: 'Number of completed bookings' })
  completedBookings: number;

  @ApiProperty({ description: 'Number of cancelled bookings' })
  cancelledBookings: number;
}
