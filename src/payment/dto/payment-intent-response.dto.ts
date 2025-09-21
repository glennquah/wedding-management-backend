import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from './payment-response.dto';

export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Stripe client secret for frontend payment processing',
    example: 'pi_1234567890abcdef_secret_xyz'
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890abcdef'
  })
  paymentIntentId: string;

  @ApiProperty({
    description: 'Created payment record',
    type: PaymentResponseDto
  })
  payment: PaymentResponseDto;
}