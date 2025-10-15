import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Microsite, Prisma, Wedding } from '@prisma/client';
import { AiServiceService } from '../ai-service/ai-service.service';
import { ConfirmationStatus } from '../common/confirmation-status.enum';
import { GuestResponseDto } from '../guest/dto/guest-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMicrositeDto } from './dto/create-microsite.dto';
import { GenerateMicrositeDto } from './dto/generate-microsite.dto';
import {
  FaqItemDto,
  MicrositeResponseDto,
  ScheduleItemDto,
} from './dto/microsite-response.dto';
import { UpdateMicrositeDto } from './dto/update-microsite.dto';

@Injectable()
export class MicrositeService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiServiceService,
  ) {}

  private toMicrositeResponseDto(
    microsite: Microsite & { wedding?: Wedding | null },
  ): MicrositeResponseDto {
    return {
      id: microsite.id,
      templateNumber: microsite.templateNumber,
      slug: microsite.slug,
      coupleName: microsite.coupleName,
      heroImages: microsite.heroImages,
      imageGallery: microsite.imageGallery,
      schedule: microsite.schedule as unknown as ScheduleItemDto[],
      faqs: microsite.faqs as unknown as FaqItemDto[],
      weddingId: microsite.weddingId,
      weddingName: microsite.wedding?.name || '',
      weddingLocation: microsite.wedding?.location || null,
      weddingDate: microsite.wedding?.date || null,
      createdAt: microsite.createdAt,
      updatedAt: microsite.updatedAt,
    };
  }

  async getMicrositeBySlug(
    micrositeSlug: string,
  ): Promise<MicrositeResponseDto> {
    const microsite = await this.prisma.microsite.findUnique({
      where: { slug: micrositeSlug },
      include: {
        wedding: true,
      },
    });

    if (!microsite) {
      throw new NotFoundException(
        `Microsite with slug "${micrositeSlug}" not found`,
      );
    }

    return this.toMicrositeResponseDto(microsite);
  }

  async getMicrositeByWeddingId(
    weddingId: number,
  ): Promise<MicrositeResponseDto> {
    const microsite = await this.prisma.microsite.findUnique({
      where: { weddingId: weddingId },
      include: {
        wedding: true,
      },
    });

    if (!microsite) {
      throw new NotFoundException(
        `Microsite for wedding ID ${weddingId} not found`,
      );
    }

    return this.toMicrositeResponseDto(microsite);
  }

  async validateMicrositePassword(
    micrositeSlug: string,
    password: string,
  ): Promise<{ isValid: boolean }> {
    const microsite = await this.prisma.microsite.findUnique({
      where: { slug: micrositeSlug },
    });

    if (!microsite) {
      throw new NotFoundException(
        `Microsite with slug "${micrositeSlug}" not found`,
      );
    }

    const isValid = microsite.password === password;

    return { isValid };
  }

  async getGuestByNameAndWedding(
    fullName: string,
    micrositeSlug: string,
  ): Promise<GuestResponseDto> {
    const microsite = await this.prisma.microsite.findUnique({
      where: { slug: micrositeSlug },
      include: {
        wedding: {
          include: {
            guests: {
              where: {
                name: {
                  equals: fullName,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
    });

    if (!microsite) {
      throw new NotFoundException(
        `Microsite with slug "${micrositeSlug}" not found`,
      );
    }

    const guest = microsite.wedding.guests[0];
    if (!guest) {
      throw new NotFoundException(
        `Guest "${fullName}" not found in microsite "${micrositeSlug}"`,
      );
    }

    return {
      id: guest.id,
      email: guest.email,
      name: guest.name,
      allergies: guest.allergies,
      group: guest.group,
      confirmationStatus: guest.confirmationStatus as ConfirmationStatus,
      weddingId: guest.weddingId,
      weddingName: microsite.wedding.name,
      primaryGuestId: guest.primaryGuestId,
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt,
    };
  }

  async confirmGuest(
    guestId: number,
    weddingId: number,
    allergies?: string,
  ): Promise<GuestResponseDto> {
    // Find the guest that belongs to both the guestId and weddingId
    const guest = await this.prisma.guest.findFirst({
      where: {
        id: guestId,
        weddingId: weddingId,
      },
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with ID ${guestId} not found for wedding ${weddingId}`,
      );
    }

    // Prevent re-confirmation
    if (guest.confirmationStatus === ConfirmationStatus.CONFIRMED) {
      throw new ConflictException(
        `Guest with ID ${guestId} has already confirmed attendance`,
      );
    }

    const updatedGuest = await this.prisma.guest.update({
      where: { id: guestId },
      data: {
        confirmationStatus: ConfirmationStatus.CONFIRMED,
        ...(typeof allergies === 'string' && allergies.length > 0
          ? { allergies }
          : {}),
      },
    });
    // Fetch wedding name for the updated guest
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: updatedGuest.weddingId },
    });

    return {
      id: updatedGuest.id,
      email: updatedGuest.email,
      name: updatedGuest.name,
      allergies: updatedGuest.allergies,
      group: updatedGuest.group,
      confirmationStatus: updatedGuest.confirmationStatus as ConfirmationStatus,
      weddingId: updatedGuest.weddingId,
      weddingName: wedding?.name ?? '',
      primaryGuestId: updatedGuest.primaryGuestId,
      createdAt: updatedGuest.createdAt,
      updatedAt: updatedGuest.updatedAt,
    };
  }

  async createMicrosite(
    userId: number,
    createMicrositeDto: CreateMicrositeDto,
  ): Promise<MicrositeResponseDto> {
    // Verify admin exists and owns the wedding
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: {
        weddings: {
          where: { id: createMicrositeDto.weddingId },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    if (admin.weddings.length === 0) {
      throw new NotFoundException(
        `Wedding with ID ${createMicrositeDto.weddingId} not found or not owned by admin`,
      );
    }

    // Check if microsite slug is unique
    const existingMicrosite = await this.prisma.microsite.findUnique({
      where: { slug: createMicrositeDto.slug },
    });

    if (existingMicrosite) {
      throw new ConflictException(
        `Microsite with slug "${createMicrositeDto.slug}" already exists`,
      );
    }

    // Check if wedding already has a microsite
    const existingMicrositeForWedding = await this.prisma.microsite.findUnique({
      where: { weddingId: createMicrositeDto.weddingId },
    });

    if (existingMicrositeForWedding) {
      throw new ConflictException(
        `Wedding with ID ${createMicrositeDto.weddingId} already has a microsite`,
      );
    }

    // Create the microsite
    const microsite = await this.prisma.microsite.create({
      data: {
        templateNumber: createMicrositeDto.templateNumber,
        slug: createMicrositeDto.slug,
        coupleName: createMicrositeDto.coupleName,
        heroImages: createMicrositeDto.heroImages,
        imageGallery: createMicrositeDto.imageGallery,
        schedule:
          createMicrositeDto.schedule as unknown as Prisma.InputJsonValue,
        faqs: createMicrositeDto.faqs as unknown as Prisma.InputJsonValue,
        password: createMicrositeDto.password,
        weddingId: createMicrositeDto.weddingId,
      },
      include: {
        wedding: true,
      },
    });

    return this.toMicrositeResponseDto(microsite);
  }

  async updateMicrosite(
    userId: number,
    micrositeId: number,
    updateMicrositeDto: UpdateMicrositeDto,
  ): Promise<MicrositeResponseDto> {
    // First, get the microsite and verify ownership
    const existingMicrosite = await this.prisma.microsite.findUnique({
      where: { id: micrositeId },
      include: {
        wedding: {
          include: {
            admins: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!existingMicrosite) {
      throw new NotFoundException(`Microsite with ID ${micrositeId} not found`);
    }

    if (existingMicrosite.wedding.admins.length === 0) {
      throw new NotFoundException(
        `Microsite with ID ${micrositeId} not found or not owned by admin`,
      );
    }

    // Check if slug is being updated and is unique
    if (
      updateMicrositeDto.slug &&
      updateMicrositeDto.slug !== existingMicrosite.slug
    ) {
      const slugExists = await this.prisma.microsite.findUnique({
        where: { slug: updateMicrositeDto.slug },
      });

      if (slugExists) {
        throw new ConflictException(
          `Microsite with slug "${updateMicrositeDto.slug}" already exists`,
        );
      }
    }

    // Update the microsite
    const updatedMicrosite = await this.prisma.microsite.update({
      where: { id: micrositeId },
      data: {
        templateNumber: updateMicrositeDto.templateNumber,
        slug: updateMicrositeDto.slug,
        coupleName: updateMicrositeDto.coupleName,
        heroImages: updateMicrositeDto.heroImages,
        imageGallery: updateMicrositeDto.imageGallery,
        schedule:
          updateMicrositeDto.schedule as unknown as Prisma.InputJsonValue,
        faqs: updateMicrositeDto.faqs as unknown as Prisma.InputJsonValue,
        password: updateMicrositeDto.password,
      },
      include: {
        wedding: true,
      },
    });

    return this.toMicrositeResponseDto(updatedMicrosite);
  }

  async deleteMicrosite(
    userId: number,
    micrositeId: number,
  ): Promise<{ message: string }> {
    // First, get the microsite and verify ownership
    const existingMicrosite = await this.prisma.microsite.findUnique({
      where: { id: micrositeId },
      include: {
        wedding: {
          include: {
            admins: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!existingMicrosite) {
      throw new NotFoundException(`Microsite with ID ${micrositeId} not found`);
    }

    if (existingMicrosite.wedding.admins.length === 0) {
      throw new NotFoundException(
        `Microsite with ID ${micrositeId} not found or not owned by admin`,
      );
    }

    // Delete the microsite
    await this.prisma.microsite.delete({
      where: { id: micrositeId },
    });

    return {
      message: `Microsite with ID ${micrositeId} has been successfully deleted`,
    };
  }

  async generateMicrositeContent(
    dto: GenerateMicrositeDto,
  ): Promise<Omit<CreateMicrositeDto, 'password' | 'weddingId'>> {
    // Fetch wedding details
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    // Pass wedding object to AI service for content generation
    const content = await this.aiService.generateMicrosite(dto, wedding);
    return content;
  }
}
