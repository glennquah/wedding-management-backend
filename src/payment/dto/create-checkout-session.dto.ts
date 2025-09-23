import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Order ID to create checkout session for' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ description: 'Success URL to redirect to after payment', required: false })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({ description: 'Cancel URL to redirect to if payment is cancelled', required: false })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}