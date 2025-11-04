import { ApiProperty } from '@nestjs/swagger';

export class VendorPayoutResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  vendorId: number;

  @ApiProperty()
  stripeTransferId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  earningsCount: number;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiProperty({ nullable: true })
  stripePayoutId?: string;

  @ApiProperty({ nullable: true })
  failureReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreatePayoutDto {
  @ApiProperty({ description: 'Vendor ID to pay out' })
  vendorId: number;

  @ApiProperty({
    required: false,
    description: 'Start date for payout period (defaults to last payout)',
  })
  periodStart?: Date;

  @ApiProperty({
    required: false,
    description: 'End date for payout period (defaults to now)',
  })
  periodEnd?: Date;
}

export class BatchPayoutDto {
  @ApiProperty({
    required: false,
    description:
      'Specific vendor IDs to pay out (if not provided, pays all eligible vendors)',
    type: [Number],
  })
  vendorIds?: number[];

  @ApiProperty({
    required: false,
    description: 'Start date for payout period',
  })
  periodStart?: Date;

  @ApiProperty({
    required: false,
    description: 'End date for payout period (defaults to now)',
  })
  periodEnd?: Date;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Minimum payout amount (to avoid small transfers)',
  })
  minimumPayoutAmount?: number;
}

export class PayoutResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  vendorId: number;

  @ApiProperty({ required: false })
  payout?: VendorPayoutResponseDto;

  @ApiProperty({ required: false })
  error?: string;
}

export class BatchPayoutResultDto {
  @ApiProperty()
  totalVendors: number;

  @ApiProperty()
  successfulPayouts: number;

  @ApiProperty()
  failedPayouts: number;

  @ApiProperty({ type: [PayoutResultDto] })
  results: PayoutResultDto[];

  @ApiProperty()
  totalAmountPaidOut: number;

  @ApiProperty()
  currency: string;
}

export class VendorInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class VendorDetailsDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ type: VendorInfoDto })
  user: VendorInfoDto;
}

export class AllVendorsPayoutResponseDto extends VendorPayoutResponseDto {
  @ApiProperty({ type: VendorDetailsDto })
  vendor: VendorDetailsDto;
}
