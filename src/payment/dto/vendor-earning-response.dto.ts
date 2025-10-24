import { ApiProperty } from '@nestjs/swagger';

export class VendorEarningResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  vendorId: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  listingId: number;

  @ApiProperty()
  grossAmount: number;

  @ApiProperty()
  platformFee: number;

  @ApiProperty()
  netAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isPaidOut: boolean;

  @ApiProperty({ nullable: true })
  payoutId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class VendorEarningsSummaryDto {
  @ApiProperty()
  vendorId: number;

  @ApiProperty({ description: 'Total earnings before platform fee' })
  totalGrossAmount: number;

  @ApiProperty({ description: 'Total 10% platform commission' })
  totalPlatformFee: number;

  @ApiProperty({ description: 'Total amount vendor will receive' })
  totalNetAmount: number;

  @ApiProperty({ description: 'Amount already paid out' })
  paidOutAmount: number;

  @ApiProperty({ description: 'Amount pending payout' })
  pendingAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  paidBookings: number;

  @ApiProperty()
  pendingBookings: number;
}
