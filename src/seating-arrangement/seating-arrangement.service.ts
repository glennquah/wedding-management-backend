import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatingArrangementDto } from './dto/create-seating-arrangement.dto';
import { UpdateSeatingArrangementDto } from './dto/update-seating-arrangement.dto';
import { SeatingArrangementResponseDto } from './dto/seating-arrangement-response.dto';

@Injectable()
export class SeatingArrangementService {
  constructor(private prisma: PrismaService) {}

  async create(
    weddingId: number,
    createSeatingArrangementDto: CreateSeatingArrangementDto,
  ): Promise<SeatingArrangementResponseDto> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    // Check if seating arrangement already exists for this wedding
    const existingSeatingArrangement =
      await this.prisma.seatingArrangement.findUnique({
        where: { weddingId },
      });

    if (existingSeatingArrangement) {
      throw new ConflictException(
        `Seating arrangement already exists for wedding ${weddingId}`,
      );
    }

    const seatingArrangement = await this.prisma.seatingArrangement.create({
      data: {
        weddingId,
        groupPriorities: createSeatingArrangementDto.groupPriorities || null,
        tables: createSeatingArrangementDto.tables || [],
      },
    });

    return this.toSeatingArrangementResponseDto(seatingArrangement);
  }

  async findByWeddingId(
    weddingId: number,
  ): Promise<SeatingArrangementResponseDto | null> {
    const seatingArrangement = await this.prisma.seatingArrangement.findUnique({
      where: { weddingId },
    });

    if (!seatingArrangement) {
      return null;
    }

    return this.toSeatingArrangementResponseDto(seatingArrangement);
  }

  async update(
    weddingId: number,
    updateSeatingArrangementDto: UpdateSeatingArrangementDto,
  ): Promise<SeatingArrangementResponseDto> {
    const seatingArrangement = await this.prisma.seatingArrangement.findUnique({
      where: { weddingId },
    });

    if (!seatingArrangement) {
      throw new NotFoundException(
        `Seating arrangement not found for wedding ${weddingId}`,
      );
    }

    // Build update data object, only including defined fields
    const updateData: {
      groupPriorities?: Record<string, number>;
      tables?: string[][];
    } = {};

    if (updateSeatingArrangementDto.groupPriorities !== undefined) {
      updateData.groupPriorities = updateSeatingArrangementDto.groupPriorities;
    }

    if (updateSeatingArrangementDto.tables !== undefined) {
      updateData.tables = updateSeatingArrangementDto.tables;
    }

    const updatedSeatingArrangement =
      await this.prisma.seatingArrangement.update({
        where: { weddingId },
        data: updateData,
      });

    return this.toSeatingArrangementResponseDto(updatedSeatingArrangement);
  }

  async remove(weddingId: number): Promise<void> {
    const seatingArrangement = await this.prisma.seatingArrangement.findUnique({
      where: { weddingId },
    });

    if (!seatingArrangement) {
      throw new NotFoundException(
        `Seating arrangement not found for wedding ${weddingId}`,
      );
    }

    await this.prisma.seatingArrangement.delete({
      where: { weddingId },
    });
  }

  private toSeatingArrangementResponseDto(
    seatingArrangement: any,
  ): SeatingArrangementResponseDto {
    return {
      id: seatingArrangement.id,
      weddingId: seatingArrangement.weddingId,
      groupPriorities: seatingArrangement.groupPriorities,
      tables: seatingArrangement.tables as string[][],
      createdAt: seatingArrangement.createdAt,
      updatedAt: seatingArrangement.updatedAt,
    };
  }
}
