import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../common/order-status.enum';

export class OrderListingDetailResponseDto {
  @ApiProperty({
    description: 'ID of the order',
    example: 1,
  })
  orderId: number;

  @ApiProperty({
    description: 'ID of the listing',
    example: 5,
  })
  listingId: number;

  @ApiProperty({
    description: 'Name of the listing',
    example: 'Premium Photography Package',
  })
  listingName: string;

  @ApiProperty({
    description: 'Date of the order/booking',
    example: '2024-06-15',
  })
  date: string;

  @ApiProperty({
    description: 'Status of the order listing',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Amount for this listing',
    example: 2500.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'SGD',
  })
  currency: string;

  @ApiProperty({
    description: 'Vendor name',
    example: 'Elegant Photography Studio',
  })
  vendorName: string;
}
