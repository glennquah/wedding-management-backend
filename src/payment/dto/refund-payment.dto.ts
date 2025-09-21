import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Stripe payment intent ID to refund',
    example: 'pi_1234567890abcdef'
  })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    description: 'Amount to refund. If not provided, full amount will be refunded.',
    required: false,
    minimum: 0.01,
    example: 50.00
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}