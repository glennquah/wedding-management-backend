import { Injectable, NotFoundException } from '@nestjs/common';
import { Cart, CartItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CartResponseDto } from './dto/cart-response.dto';

type CartItemWithListing = CartItem & {
  listing: { listingName: string; price: number; imageUrls: string[] };
};
type CartWithItems = Cart & { items: CartItemWithListing[] };

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private toCartItemResponseDto(
    item: CartItemWithListing,
  ): CartItemResponseDto {
    return {
      id: item.id,
      listingId: item.listingId,
      listingName: item.listing.listingName,
      price: item.listing.price,
      imageUrls: item.listing.imageUrls,
    };
  }

  private toCartResponseDto(cart: CartWithItems): CartResponseDto {
    return {
      id: cart.id,
      adminId: cart.adminId,
      total: cart.total,
      items: cart.items
        ? cart.items.map((i) => this.toCartItemResponseDto(i))
        : [],
    };
  }

  private async recalculateTotal(cartId: number): Promise<CartResponseDto> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { listing: true },
    });

    const total = items.reduce((sum, item) => sum + item.listing.price, 0);

    const cart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
      include: { items: { include: { listing: true } } },
    });

    return this.toCartResponseDto(cart);
  }

  async addToCart(dto: AddToCartDto): Promise<CartResponseDto> {
    let cart = await this.prisma.cart.findUnique({
      where: { adminId: dto.adminId },
    });

    // Creates cart if doesnt exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { adminId: dto.adminId },
      });
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.cartItem.upsert({
      where: {
        cartId_listingId: { cartId: cart.id, listingId: dto.listingId },
      },
      update: {},
      create: { cartId: cart.id, listingId: dto.listingId },
    });

    return this.recalculateTotal(cart.id);
  }

  async getCart(adminId: number): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { adminId },
      include: { items: { include: { listing: true } } },
    });

    if (!cart) throw new NotFoundException('Cart not found');
    return this.toCartResponseDto(cart);
  }

  async removeCartItemFromCart(
    adminId: number,
    listingId: number,
  ): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { adminId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_listingId: { cartId: cart.id, listingId } },
    });
    if (!item) throw new NotFoundException('Item not found in cart');

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.recalculateTotal(cart.id);
  }

  async deleteCart(adminId: number): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { adminId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await this.prisma.cart.delete({ where: { id: cart.id } });
  }

  async clearCart(adminId: number): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { adminId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.recalculateTotal(cart.id);
  }
}
