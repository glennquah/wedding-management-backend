import { Injectable, NotFoundException } from '@nestjs/common';
import { Admin, Guest, User, Wedding } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { BudgetBucket } from '../common/budget-bucket.enum';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { GuestCountBucket } from '../common/guest-count-bucket.enum';
import { UserRole } from '../common/user-role.enum';
import { WeddingService as WeddingServiceEnum } from '../common/wedding-service.enum';
import { WeddingStyle } from '../common/wedding-style.enum';
import { WeddingType } from '../common/wedding-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { OptimizeDateResponseDto } from '../calendar/dto/date-optimization.dto';

type WeddingWithRelations = Wedding & {
  guests?: Guest[];
  mainCouple?: (Admin & { user: User })[];
};

@Injectable()
export class WeddingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWeddingDto): Promise<Wedding> {
    return this.prisma.wedding.create({
      data: {
        name: dto.name,
        date: dto.date ? new Date(dto.date) : undefined,
        location: dto.location,
        weddingType: dto.weddingType,
        budgetBucket: dto.budgetBucket,
        guestCountBucket: dto.guestCountBucket,
        preferredStyle: dto.preferredStyle,
        preferredServices: dto.preferredServices,
        notificationDetails: {
          create: {},
        },
      },
    });
  }

  async findAll(): Promise<Wedding[]> {
    return this.prisma.wedding.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        guests: true,
      },
    });
  }

  async findByAdminId(adminId: number): Promise<Wedding[]> {
    return this.prisma.wedding.findMany({
      where: {
        admins: {
          some: {
            userId: adminId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Wedding> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id },
      include: {
        guests: true,
        microsite: true,
        mainCouple: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${id} not found`);
    }

    return wedding;
  }

  async update(id: number, dto: UpdateWeddingDto): Promise<Wedding> {
    await this.findById(id);

    const updateData: Partial<Wedding> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.weddingType !== undefined) updateData.weddingType = dto.weddingType;
    if (dto.budgetBucket !== undefined)
      updateData.budgetBucket = dto.budgetBucket;
    if (dto.guestCountBucket !== undefined)
      updateData.guestCountBucket = dto.guestCountBucket;
    if (dto.preferredStyle !== undefined)
      updateData.preferredStyle = dto.preferredStyle;
    if (dto.preferredServices !== undefined)
      updateData.preferredServices = dto.preferredServices;

    return this.prisma.wedding.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.wedding.delete({
      where: { id },
    });
  }

  async setWeddingDate(weddingId: number, date: string): Promise<Wedding> {
    await this.findById(weddingId);

    const updatedWedding = await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        date: new Date(date),
      },
      include: {
        guests: true,
      },
    });

    return updatedWedding;
  }

  toWeddingResponseDto(wedding: WeddingWithRelations): WeddingResponseDto {
    return {
      id: wedding.id,
      mainCouple:
        wedding.mainCouple?.map((admin: Admin & { user: User }) => ({
          id: admin.userId,
          name: admin.user?.name,
          email: admin.user?.email,
          role: admin.user?.role as unknown as UserRole,
          createdAt: admin.user?.createdAt,
          updatedAt: admin.user?.updatedAt,
          isSuspended: admin.isSuspended,
          onboardedDate: admin.onboardedDate,
        })) || [],
      name: wedding.name,
      date: wedding.date?.toISOString(),
      location: wedding.location,
      guests: wedding.guests?.map((guest: Guest) => ({
        id: guest.id,
        name: guest.name,
        email: guest.email,
        allergies: guest.allergies,
        group: guest.group,
        confirmationStatus: guest.confirmationStatus as ConfirmationStatus,
        weddingId: guest.weddingId,
        weddingName: wedding.name,
        primaryGuestId: guest.primaryGuestId,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
      })),
      weddingType: wedding.weddingType as WeddingType,
      budgetBucket: wedding.budgetBucket as BudgetBucket,
      guestCountBucket: wedding.guestCountBucket as GuestCountBucket,
      preferredStyle: wedding.preferredStyle as WeddingStyle,
      preferredServices: wedding.preferredServices as WeddingServiceEnum[],
      createdAt: wedding.createdAt.toISOString(),
      updatedAt: wedding.updatedAt.toISOString(),
    };
  }

  async addKeyAttendee(weddingId: number, adminId: number): Promise<void> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { keyAttendeeIds: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Check if already added
    if (wedding.keyAttendeeIds.includes(adminId)) {
      return; // Already a key attendee
    }

    // Add to array
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        keyAttendeeIds: {
          push: adminId,
        },
      },
    });
  }

  async removeKeyAttendee(weddingId: number, adminId: number): Promise<void> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { keyAttendeeIds: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Remove from array
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        keyAttendeeIds: wedding.keyAttendeeIds.filter((id) => id !== adminId),
      },
    });
  }

  async getKeyAttendees(weddingId: number): Promise<number[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { keyAttendeeIds: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    return wedding.keyAttendeeIds;
  }

  async getMainCouple(weddingId: number) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: {
          include: {
            user: true,
            googleCalendarConnection: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Return admin accounts with their calendar connection status
    return wedding.mainCouple.map((admin) => {
      return {
        id: admin.userId,
        name: admin.user.name,
        email: admin.user.email,
        calendarConnected: !!admin.googleCalendarConnection,
      };
    });
  }

  async updateDateOptimizerPreferences(
    weddingId: number,
    preferences: {
      earliestDate?: string;
      latestDate?: string;
      preferredDays?: string[];
      lastResults?: any;
    },
  ): Promise<void> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        dateOptimizerEarliestDate: preferences.earliestDate,
        dateOptimizerLatestDate: preferences.latestDate,
        dateOptimizerPreferredDays: preferences.preferredDays,
        dateOptimizerLastResults: preferences.lastResults,
      },
    });
  }

  async getDateOptimizerPreferences(weddingId: number) {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      select: {
        dateOptimizerEarliestDate: true,
        dateOptimizerLatestDate: true,
        dateOptimizerPreferredDays: true,
        dateOptimizerLastResults: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    return {
      earliestDate: wedding.dateOptimizerEarliestDate,
      latestDate: wedding.dateOptimizerLatestDate,
      preferredDays: wedding.dateOptimizerPreferredDays,
      lastResults: wedding.dateOptimizerLastResults
        ? plainToInstance(
            OptimizeDateResponseDto,
            wedding.dateOptimizerLastResults,
            { excludeExtraneousValues: false },
          )
        : undefined,
    };
  }

  async addPartnerToMainCouple(
    weddingId: number,
    partnerId: number,
  ): Promise<void> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Check if partner is already in main couple
    if (wedding.mainCouple.some((admin) => admin.userId === partnerId)) {
      return; // Already in main couple
    }

    // Verify the partner admin exists
    const partnerAdmin = await this.prisma.admin.findUnique({
      where: { userId: partnerId },
    });

    if (!partnerAdmin) {
      throw new NotFoundException(`Admin with id ${partnerId} not found`);
    }

    // Add partner to main couple and set their main wedding
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        mainCouple: {
          connect: { userId: partnerId },
        },
      },
    });
  }

  async removePartnerFromMainCouple(
    weddingId: number,
    partnerId: number,
  ): Promise<void> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with id ${weddingId} not found`);
    }

    // Check if partner is in main couple
    if (!wedding.mainCouple.some((admin) => admin.userId === partnerId)) {
      return; // Not in main couple, nothing to do
    }

    // Remove partner from main couple and unset their main wedding
    await this.prisma.wedding.update({
      where: { id: weddingId },
      data: {
        mainCouple: {
          disconnect: { userId: partnerId },
        },
      },
    });
  }
}
