import { IsEnum, IsNumber } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentIntentDto {
  @IsNumber()
  orderId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}