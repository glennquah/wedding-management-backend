import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/dto/jwt-payload.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListingDetailResponseDto } from './dto/order-listing-detail-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Wedding or listings not found.' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.create(createOrderDto);
    return this.orderService.toOrderResponseDto(order);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders.',
    type: [OrderResponseDto],
  })
  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderService.findAll();
    return orders.map((order) => this.orderService.toOrderResponseDto(order));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'The order has been found.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.findOne(id);
    return this.orderService.toOrderResponseDto(order);
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get orders by wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'List of orders for the wedding.',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async findByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orderService.findByWedding(weddingId);
    return orders.map((order) => this.orderService.toOrderResponseDto(order));
  }

  @Get('wedding/:weddingId/successful')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Get successful orders (PAID or COMPLETED) by wedding ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of successful orders for the wedding.',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async findSuccessfulOrdersByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<OrderResponseDto[]> {
    const orders =
      await this.orderService.findSuccessfulOrdersByWedding(weddingId);
    return orders.map((order) => this.orderService.toOrderResponseDto(order));
  }

  @Get('wedding/:weddingId/listing-details')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({
    summary:
      'Get detailed order listing information (listing name, date, status, amount) by wedding ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of order listing details for the wedding.',
    type: [OrderListingDetailResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Wedding not found.' })
  async getOrderListingDetailsByWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<OrderListingDetailResponseDto[]> {
    return this.orderService.getOrderListingDetailsByWedding(weddingId);
  }

  @Get('vendor/:vendorId')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get orders by vendor ID' })
  @ApiResponse({
    status: 200,
    description: 'List of orders containing listings from this vendor.',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async findByVendor(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orderService.findByVendor(vendorId);
    return orders.map((order) => this.orderService.toOrderResponseDto(order));
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully updated.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.update(id, updateOrderDto);
    return this.orderService.toOrderResponseDto(order);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully cancelled.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled.' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.cancel(id);
    return this.orderService.toOrderResponseDto(order);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.orderService.delete(id);
  }

  @Delete(':orderId/listings/:listingId')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a single listing from an order' })
  @ApiResponse({
    status: 200,
    description: 'The order listing has been deleted.',
  })
  @ApiResponse({ status: 404, description: 'Order or listing not found.' })
  async deleteListing(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<OrderResponseDto | void> {
    const updated = await this.orderService.deleteListing(orderId, listingId);
    if (updated) return this.orderService.toOrderResponseDto(updated);
  }

  @Post(':orderId/listings/:listingId/vendor-confirm')
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: 'Vendor confirms a specific listing in an order' })
  @ApiResponse({
    status: 200,
    description: 'The listing has been successfully confirmed by the vendor.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order or listing not found.' })
  @ApiResponse({ status: 400, description: 'Listing cannot be confirmed.' })
  @ApiResponse({
    status: 403,
    description: 'Vendor does not own this listing.',
  })
  async vendorConfirmListing(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: Request & { user: JwtPayload },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.vendorConfirmListing(
      orderId,
      listingId,
      req.user.sub,
    );
    return this.orderService.toOrderResponseDto(order);
  }

  @Post(':orderId/listings/:listingId/vendor-reject')
  @Roles(UserRole.VENDOR)
  @ApiOperation({
    summary:
      'Vendor rejects a specific listing in an order and triggers partial refund',
  })
  @ApiResponse({
    status: 200,
    description:
      'The listing has been successfully rejected by the vendor and partial refund processed.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order or listing not found.' })
  @ApiResponse({ status: 400, description: 'Listing cannot be rejected.' })
  @ApiResponse({
    status: 403,
    description: 'Vendor does not own this listing.',
  })
  async vendorRejectListing(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: Request & { user: JwtPayload },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.vendorRejectListing(
      orderId,
      listingId,
      req.user.sub,
    );
    return this.orderService.toOrderResponseDto(order);
  }
}
