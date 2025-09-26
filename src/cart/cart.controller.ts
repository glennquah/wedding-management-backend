import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a listing to the admin cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  addToCart(@Body() dto: AddToCartDto): Promise<CartResponseDto> {
    return this.cartService.addToCart(dto);
  }

  @Get(':adminId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get the admin cart with all items' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  getCart(
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(adminId);
  }

  @Delete(':adminId/item/:listingId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a listing from the admin cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  removeItem(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<CartResponseDto> {
    return this.cartService.removeCartItemFromCart(adminId, listingId);
  }

  @Delete(':adminId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete entire admin cart' })
  @ApiResponse({
    status: 204,
    description: 'Cart successfully deleted (no content returned)',
  })
  @HttpCode(204)
  deleteCart(@Param('adminId', ParseIntPipe) adminId: number): Promise<void> {
    return this.cartService.deleteCart(adminId);
  }

  @Delete(':adminId/clear')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear all items from the admin cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  clearCart(
    @Param('adminId', ParseIntPipe) adminId: number,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(adminId);
  }
}
