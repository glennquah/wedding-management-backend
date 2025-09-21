import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the payment' })
  id: number;

  @ApiProperty({ description: 'Stripe payment intent ID' })
  stripePaymentIntentId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    enumName: 'PaymentMethod'
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Current payment status',
    enum: PaymentStatus,
    enumName: 'PaymentStatus'
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Stripe charge ID',
    required: false
  })
  stripeChargeId?: string;

  @ApiProperty({
    description: 'Receipt URL from Stripe',
    required: false
  })
  receiptUrl?: string;

  @ApiProperty({
    description: 'Failure reason if payment failed',
    required: false
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Amount refunded',
    required: false,
    default: 0
  })
  refundedAmount?: number;

  @ApiProperty({ description: 'Order ID this payment belongs to' })
  orderId: number;

  @ApiProperty({ description: 'Payment creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Payment last update timestamp' })
  updatedAt: Date;
}