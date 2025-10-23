import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import {
  VendorEarningResponseDto,
  VendorEarningsSummaryDto,
} from './dto/vendor-earning-response.dto';
import {
  VendorPayoutResponseDto,
  CreatePayoutDto,
  BatchPayoutDto,
  BatchPayoutResultDto,
} from './dto/vendor-payout-response.dto';
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
  async createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
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
  async getPaymentHistory(
    @Param('orderId') orderId: string,
  ): Promise<PaymentResponseDto[]> {
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
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody!);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('vendor-earnings/:vendorId')
  @ApiOperation({ summary: 'Get vendor earnings history' })
  @ApiResponse({
    status: 200,
    description: 'Vendor earnings retrieved successfully.',
    type: [VendorEarningResponseDto],
  })
  async getVendorEarnings(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<VendorEarningResponseDto[]> {
    return this.paymentService.getVendorEarnings(vendorId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('vendor-earnings/:vendorId/summary')
  @ApiOperation({ summary: 'Get vendor earnings summary' })
  @ApiResponse({
    status: 200,
    description: 'Vendor earnings summary retrieved successfully.',
    type: VendorEarningsSummaryDto,
  })
  async getVendorEarningsSummary(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<VendorEarningsSummaryDto> {
    return this.paymentService.getVendorEarningsSummary(vendorId);
  }

  // ===============================
  // Vendor Payout Endpoints
  // ===============================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('vendor-payouts/:vendorId')
  @ApiOperation({ summary: 'Get vendor payout history' })
  @ApiResponse({
    status: 200,
    description: 'Vendor payouts retrieved successfully.',
    type: [VendorPayoutResponseDto],
  })
  async getVendorPayouts(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<VendorPayoutResponseDto[]> {
    return this.paymentService.getVendorPayouts(vendorId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post('vendor-payouts/create')
  @ApiOperation({ summary: 'Create a payout for a specific vendor (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Payout created successfully.',
    type: VendorPayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreatePayoutDto })
  async createVendorPayout(
    @Body() createPayoutDto: CreatePayoutDto,
  ): Promise<VendorPayoutResponseDto> {
    return this.paymentService.createVendorPayout(createPayoutDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post('vendor-payouts/batch')
  @ApiOperation({
    summary: 'Create batch payouts for multiple vendors (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Batch payouts processed.',
    type: BatchPayoutResultDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: BatchPayoutDto })
  async createBatchPayouts(
    @Body() batchPayoutDto: BatchPayoutDto,
  ): Promise<BatchPayoutResultDto> {
    return this.paymentService.createBatchPayouts(batchPayoutDto);
  }
}
