import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty({ description: 'Unique identifier for the order' })
  id: number;

  @ApiProperty({
    description: 'Status of the order',
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  orderStatus: OrderStatus;

  @ApiProperty({ description: 'Total amount for the order' })
  totalAmount: number;

  @ApiProperty({ description: 'Currency code for the order' })
  currency: string;

  @ApiProperty({ description: 'Date when the order was purchased' })
  purchaseDate: Date;

  @ApiProperty({
    description: 'Expiration time for pending orders',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Additional remarks about the order',
    required: false,
  })
  remark?: string;

  @ApiProperty({ description: 'Wedding ID this order belongs to' })
  weddingId: number;

  @ApiProperty({ description: 'Order creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Order last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Listings included in this order',
    required: false,
  })
  listings?: any[];

  @ApiProperty({
    description: 'Payments associated with this order',
    required: false,
  })
  payments?: any[];
}