import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Guest } from '@prisma/client';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

type GuestWithAccompanying = Guest & {
  accompanyingGuests?: Guest[];
  wedding?: { name: string };
};

@Injectable()
export class GuestService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => EmailNotificationService))
    private emailNotificationService: EmailNotificationService,
  ) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    // Validate that the wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
      include: {
        microsite: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    // Separate sendEmail flag from guest data
    const { sendEmail, ...guestData } = dto;

    const guest = await this.prisma.guest.create({
      data: guestData,
      include: {
        accompanyingGuests: true,
      },
    });

    // Send RSVP if flag is set
    if (sendEmail && wedding.microsite) {
      try {
        const micrositeUrl = `${process.env.FRONTEND_URL}/microsite/${wedding.microsite.slug}`;
        const nameParts = guest.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const rsvpUrl = `${micrositeUrl}?password=${encodeURIComponent(wedding.microsite.password || '')}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;

        await this.emailNotificationService.sendRsvpInvitationEmail(
          guest.email,
          guest.name,
          wedding.name,
          rsvpUrl,
          wedding.id,
        );
      } catch (error) {
        console.error('Failed to send RSVP email:', error);
      }
    }

    return guest;
  }

  async findByWeddingId(weddingId: number): Promise<Guest[]> {
    return this.prisma.guest.findMany({
      where: { weddingId },
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllGuest(): Promise<Guest[]> {
    return this.prisma.guest.findMany({
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
        wedding: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number): Promise<Guest> {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }

    return guest;
  }

  async update(id: number, dto: UpdateGuestDto): Promise<Guest> {
    await this.findById(id);

    if (dto.confirmationStatus === ConfirmationStatus.CONFIRMED) {
      await this.prisma.guest.updateMany({
        where: { primaryGuestId: id },
        data: { confirmationStatus: ConfirmationStatus.CONFIRMED },
      });
    }
    return this.prisma.guest.update({
      where: { id },
      data: dto,
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.guest.delete({
      where: { id },
    });
  }

  async deleteByWeddingId(weddingId: number): Promise<void> {
    await this.prisma.guest.deleteMany({
      where: { weddingId },
    });
  }

  async createMultiple(guests: CreateGuestDto[]): Promise<Guest[]> {
    const createdGuests = await Promise.all(
      guests.map((guest) => this.create(guest)),
    );
    return createdGuests;
  }

  async markAttendance(id: number): Promise<Guest> {
    const guest = await this.findById(id);

    return this.prisma.guest.update({
      where: { id },
      data: { attendance: !guest.attendance },
      include: {
        accompanyingGuests: true,
        primaryGuest: true,
      },
    });
  }

  toGuestResponseDto(guest: GuestWithAccompanying): GuestResponseDto {
    return {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      allergies: guest.allergies,
      group: guest.group,
      confirmationStatus: guest.confirmationStatus as ConfirmationStatus,
      attendance: guest.attendance,
      weddingId: guest.weddingId,
      weddingName: guest.wedding?.name,
      primaryGuestId: guest.primaryGuestId,
      accompanyingGuests: guest.accompanyingGuests?.map((g) =>
        this.toGuestResponseDto(g),
      ),
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt,
    };
  }
}
