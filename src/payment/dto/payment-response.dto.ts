import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the payment' })
  id: number;

  @ApiProperty({ description: 'Stripe checkout session ID' })
  stripeCheckoutSessionId: string;

  @ApiProperty({
    description: 'Stripe payment intent ID (populated after payment)',
    required: false,
  })
  stripePaymentIntentId?: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({
    description: 'Current payment status',
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Order ID this payment belongs to' })
  orderId: number;

  @ApiProperty({ description: 'Payment creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Payment last update timestamp' })
  updatedAt: Date;
}
