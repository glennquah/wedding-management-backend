import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderCleanupService } from './order-cleanup.service';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtGuard, RolesGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderCleanupService: OrderCleanupService,
  ) {}

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
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.orderService.create(createOrderDto);
    return this.orderService.toOrderResponseDto(order);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SUPERADMIN)
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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
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
  async findByWedding(@Param('weddingId', ParseIntPipe) weddingId: number): Promise<OrderResponseDto[]> {
    const orders = await this.orderService.findByWedding(weddingId);
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
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    const order = await this.orderService.cancel(id);
    return this.orderService.toOrderResponseDto(order);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.orderService.delete(id);
  }

  @Post('cleanup')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Manually trigger cleanup of expired orders' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully.',
  })
  async manualCleanup(): Promise<{ cleanedCount: number }> {
    return this.orderCleanupService.manualCleanup();
  }
}