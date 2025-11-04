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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/user-role.enum';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import {
  VendorEarningResponseDto,
  VendorEarningsSummaryDto,
} from './dto/vendor-earning-response.dto';
import {
  BatchPayoutDto,
  BatchPayoutResultDto,
  CreatePayoutDto,
  VendorPayoutResponseDto,
  AllVendorsPayoutResponseDto,
} from './dto/vendor-payout-response.dto';
import { InvoiceGeneratorService } from './invoice-generator.service';
import { PaymentService } from './payment.service';
import { ScheduledPayoutService } from './scheduled-payout.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly scheduledPayoutService: ScheduledPayoutService,
    private readonly invoiceGeneratorService: InvoiceGeneratorService,
  ) {}

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
  @ApiOperation({
    summary: 'Create a payout for a specific vendor (Super Admin only)',
  })
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
    summary: 'Create batch payouts for multiple vendors (Super Admin only)',
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Post('vendor-payouts/trigger-scheduled')
  @ApiOperation({
    summary: 'Manually trigger scheduled payouts (Testing/Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled payouts triggered successfully.',
  })
  async triggerScheduledPayouts(): Promise<{ message: string }> {
    await this.scheduledPayoutService.triggerManualPayout();
    return { message: 'Scheduled payouts triggered successfully' };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('vendor-payouts/all')
  @ApiOperation({
    summary: 'Get all vendors payout history (Super Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All vendors payouts retrieved successfully.',
    type: [AllVendorsPayoutResponseDto],
  })
  async getAllVendorsPayout(): Promise<AllVendorsPayoutResponseDto[]> {
    return this.paymentService.getAllVendorsPayout();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('vendor-payouts/:payoutId/invoice')
  @ApiOperation({ summary: 'Download payout invoice/payslip as PDF' })
  @ApiResponse({
    status: 200,
    description: 'Invoice PDF downloaded successfully.',
  })
  @ApiResponse({ status: 404, description: 'Payout not found.' })
  async downloadPayoutInvoice(
    @Param('payoutId', ParseIntPipe) payoutId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } =
      await this.invoiceGeneratorService.generatePayoutInvoice(payoutId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
