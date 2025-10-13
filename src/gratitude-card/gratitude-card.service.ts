import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GratitudeCard, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGratitudeCardDto } from './dto/create-guest-card.dto';
import { GratitudeCardResponseDto } from './dto/gratitude-card-response.dto';
import { UpdateGratitudeCardDto } from './dto/update-gratitude-card.dto';

@Injectable()
export class GratitudeCardService {
  constructor(private prisma: PrismaService) {}

  private toGratitudeCardResponseDto(
    card: GratitudeCard,
  ): GratitudeCardResponseDto {
    return {
      id: card.id,
      weddingId: card.weddingId,
      signOffName: card.signOffName,
      guestCardMessage: card.guestCardMessage,
      collaboratorCardMessage: card.collaboratorCardMessage,
      vendorCardMessage: card.vendorCardMessage,
      guestCardPhotoURL: card.guestCardPhotoURL,
      collaboratorCardPhotoURL: card.collaboratorCardPhotoURL,
    };
  }

  async getGratitudeCardByWeddingId(
    weddingId: number,
  ): Promise<GratitudeCardResponseDto> {
    const card = await this.prisma.gratitudeCard.findUnique({
      where: { weddingId },
      include: { wedding: true },
    });

    if (!card) {
      throw new NotFoundException(
        `Gratitude card for wedding ID ${weddingId} not found`,
      );
    }

    return this.toGratitudeCardResponseDto(card);
  }

  async getGratitudeCardById(
    cardId: number,
  ): Promise<GratitudeCardResponseDto> {
    const card = await this.prisma.gratitudeCard.findUnique({
      where: { id: cardId },
      include: { wedding: true },
    });

    return this.toGratitudeCardResponseDto(card);
  }

  async createGuestGratitudeCard(
    userId: number,
    createGuestCardDto: CreateGratitudeCardDto,
  ): Promise<GratitudeCardResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { weddings: { where: { id: createGuestCardDto.weddingId } } },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    if (admin.weddings.length === 0) {
      throw new ForbiddenException(
        `Wedding with ID ${createGuestCardDto.weddingId} not found or not owned by admin`,
      );
    }

    const existingCardForWedding = await this.prisma.gratitudeCard.findUnique({
      where: { weddingId: createGuestCardDto.weddingId },
    });

    if (existingCardForWedding) {
      throw new ConflictException(
        `Wedding with ID ${createGuestCardDto.weddingId} already has gratitude cards`,
      );
    }

    const card = await this.prisma.gratitudeCard.create({
      data: {
        signOffName: createGuestCardDto.signOffName,
        guestCardMessage: createGuestCardDto.guestCardMessage,
        guestCardPhotoURL: createGuestCardDto.guestCardPhotoURL,
        weddingId: createGuestCardDto.weddingId,
      },
      include: { wedding: true },
    });

    return this.toGratitudeCardResponseDto(card);
  }

  async updateGratitudeCard(
    userId: number,
    cardId: number,
    updateCardDto: UpdateGratitudeCardDto,
  ): Promise<GratitudeCardResponseDto> {
    const existingGratitudeCard = await this.prisma.gratitudeCard.findUnique({
      where: { id: cardId },
      include: {
        wedding: { include: { admins: { where: { userId } } } },
      },
    });

    if (!existingGratitudeCard) {
      throw new NotFoundException(`Gratitude Card with ID ${cardId} not found`);
    }

    if (existingGratitudeCard.wedding.admins.length === 0) {
      throw new ForbiddenException(
        `You do not have access to these gratitude cards`,
      );
    }

    let updateData: Prisma.GratitudeCardUpdateInput = {
      signOffName: updateCardDto.signOffName,
    };

    switch (updateCardDto.recipient) {
      case 'guest':
        updateData = {
          ...updateData,
          guestCardMessage: updateCardDto.guestCardMessage,
          guestCardPhotoURL: updateCardDto.guestCardPhotoURL,
        };
        break;

      case 'collab':
        updateData = {
          ...updateData,
          collaboratorCardMessage: updateCardDto.collaboratorCardMessage,
          collaboratorCardPhotoURL: updateCardDto.collaboratorCardPhotoURL,
        };
        break;

      case 'vendor':
        updateData = {
          ...updateData,
          vendorCardMessage: updateCardDto.vendorCardMessage,
        };
        break;

      default:
        console.warn(
          `Unknown recipient type: ${updateCardDto.recipient}. Performing signOffName update only.`,
        );
        break;
    }

    const updatedCards = await this.prisma.gratitudeCard.update({
      where: { id: cardId },
      data: updateData,
      include: { wedding: true },
    });

    return this.toGratitudeCardResponseDto(updatedCards);
  }

  async deleteGratitudeCard(
    userId: number,
    cardId: number,
  ): Promise<{ message: string }> {
    const existingCards = await this.prisma.gratitudeCard.findUnique({
      where: { id: cardId },
      include: {
        wedding: { include: { admins: { where: { userId } } } },
      },
    });

    if (!existingCards) {
      throw new NotFoundException(
        `Gratitude Cards with ID ${cardId} not found`,
      );
    }

    if (existingCards.wedding.admins.length === 0) {
      throw new ForbiddenException(
        `You do not have access to these gratitude cards`,
      );
    }

    await this.prisma.gratitudeCard.delete({ where: { id: cardId } });

    return {
      message: `Gratitude cards with ID ${cardId} has been successfully deleted`,
    };
  }
}
