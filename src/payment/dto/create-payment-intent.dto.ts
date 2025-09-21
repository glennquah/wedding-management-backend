import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { PaymentMethod } from '../../common/payment-method.enum';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID to create payment intent for' })
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Payment method to use',
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}