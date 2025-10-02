import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart, CartItem } from '@prisma/client';
import { AvailabilitySlotDto } from 'src/listing/dto/create-listing.dto';
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
      selectedSlots: item.selectedSlots as unknown as AvailabilitySlotDto[],
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

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Cast listing availabilities from JSON
    const slots = listing.availabilities as unknown as AvailabilitySlotDto[];

    // Validate all selected slots
    const invalidSlots = dto.selectedSlots.filter(
      (slot) =>
        !slots.some(
          (avail) =>
            avail.startTime === slot.startTime &&
            avail.endTime === slot.endTime &&
            avail.date === slot.date,
        ),
    );

    if (invalidSlots.length > 0) {
      throw new BadRequestException(
        `The following slots are not available: ${JSON.stringify(invalidSlots)}`,
      );
    }

    await this.prisma.cartItem.upsert({
      where: {
        cartId_listingId: { cartId: cart.id, listingId: dto.listingId },
      },
      update: {
        selectedSlots: dto.selectedSlots as any,
      },
      create: {
        cartId: cart.id,
        listingId: dto.listingId,
        selectedSlots: dto.selectedSlots as any,
      },
    });

    return this.recalculateTotal(cart.id);
  }

  async getCart(adminId: number): Promise<CartResponseDto> {
    let cart = await this.prisma.cart.findUnique({
      where: { adminId },
      include: { items: { include: { listing: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { adminId },
        include: { items: { include: { listing: true } } },
      });
    }
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
