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
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('create-intent')
  @ApiOperation({ summary: 'Create a payment intent for an order' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully.',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    return this.paymentService.createPaymentIntent(createPaymentIntentDto);
  }

  @UseGuards(JwtGuard)
  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.confirmPayment(confirmPaymentDto);
  }

  @UseGuards(JwtGuard)
  @Post('refund')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully.',
  })
  @ApiResponse({ status: 400, description: 'Payment not eligible for refund.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async refundPayment(@Body() refundPaymentDto: RefundPaymentDto): Promise<any> {
    return this.paymentService.refundPayment(refundPaymentDto);
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