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
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('create-intent')
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(
      createPaymentIntentDto.orderId,
      createPaymentIntentDto.paymentMethod
    );
  }

  @UseGuards(JwtGuard)
  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(confirmPaymentDto.paymentIntentId);
  }

  @UseGuards(JwtGuard)
  @Post('refund')
  async refundPayment(@Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentService.refundPayment(
      refundPaymentDto.paymentIntentId,
      refundPaymentDto.amount
    );
  }

  @UseGuards(JwtGuard)
  @Get('history/:orderId')
  async getPaymentHistory(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentHistory(parseInt(orderId));
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody!);
  }
}