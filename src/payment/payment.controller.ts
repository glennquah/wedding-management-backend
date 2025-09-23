import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create a Stripe Checkout session for an order' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully.',
    type: CheckoutSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async createCheckoutSession(@Body() createCheckoutSessionDto: CreateCheckoutSessionDto): Promise<CheckoutSessionResponseDto> {
    return this.paymentService.createCheckoutSession(createCheckoutSessionDto);
  }



  @UseGuards(JwtGuard)
  @Get('history/:orderId')
  @ApiOperation({ summary: 'Get payment history for an order' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully.',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getPaymentHistory(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    return this.paymentService.getPaymentHistory(parseInt(orderId));
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature.' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody!);
  }

}