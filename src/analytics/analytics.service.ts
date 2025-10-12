import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { GuestCountResponseDto } from './dto/guest-count-response.dto';
import { RsvpCountResponseDto } from './dto/rsvp-count-response.dto';
import { SpendingResponseDto } from './dto/spending-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getGuestCount(weddingId: number): Promise<GuestCountResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all guests for the wedding
    const allGuests = await this.prisma.guest.findMany({
      where: { weddingId },
    });

    // Calculate primary and accompanying guests
    const primaryGuests = allGuests.filter(
      (guest) => guest.primaryGuestId === null,
    );
    const accompanyingGuests = allGuests.filter(
      (guest) => guest.primaryGuestId !== null,
    );

    return {
      totalGuests: allGuests.length,
      primaryGuests: primaryGuests.length,
      accompanyingGuests: accompanyingGuests.length,
    };
  }

  async getSpending(weddingId: number): Promise<SpendingResponseDto> {
    // Verify wedding exists and get budget info
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all orders for the wedding
    const orders = await this.prisma.order.findMany({
      where: { weddingId },
    });

    // Calculate total spending from orders
    const totalSpending = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Calculate remaining budget
    const allocatedBudget = wedding.allocatedBudget;
    const currentSpending = wedding.currentSpending;
    const remainingBudget = allocatedBudget - currentSpending;

    // Calculate budget used percentage
    const budgetUsedPercentage =
      allocatedBudget > 0 ? (currentSpending / allocatedBudget) * 100 : 0;

    return {
      totalSpending,
      allocatedBudget,
      currentSpending,
      remainingBudget,
      budgetUsedPercentage: Math.round(budgetUsedPercentage * 100) / 100, // Round to 2 decimal places
      orderCount: orders.length,
      currency: orders.length > 0 ? orders[0].currency : 'SGD',
    };
  }

  async getRsvpCount(weddingId: number): Promise<RsvpCountResponseDto> {
    // Verify wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Get all guests for the wedding
    const allGuests = await this.prisma.guest.findMany({
      where: { weddingId },
    });

    const totalInvited = allGuests.length;

    // Count guests who confirmed attendance
    const confirmed = allGuests.filter(
      (guest) => guest.confirmationStatus === ConfirmationStatus.CONFIRMED,
    ).length;

    // Count guests who haven't RSVPed yet
    const pending = allGuests.filter(
      (guest) => guest.confirmationStatus === ConfirmationStatus.PENDING,
    ).length;

    // Calculate RSVP percentage
    const rsvpPercentage =
      totalInvited > 0 ? (confirmed / totalInvited) * 100 : 0;

    return {
      totalInvited,
      confirmed,
      pending,
      rsvpPercentage: Math.round(rsvpPercentage * 100) / 100, // Round to 2 decimal places
    };
  }
}
