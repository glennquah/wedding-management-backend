import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGuestbookNoteDto } from './dto/create-guestbook-note.dto';
import { Guestbook } from '@prisma/client';
import { GuestbookResponseDto } from './dto/guestbook-response.dto';

@Injectable()
export class GuestbookService {
  constructor(private prisma: PrismaService) {}

  private toGuestbookResponseDto(guestbook: Guestbook): GuestbookResponseDto {
    return {
      id: guestbook.id,
      weddingId: guestbook.weddingId,
      guestNotes: guestbook.guestNotes as any[],
    };
  }

  async addNote(
    weddingId: number,
    noteDto: CreateGuestbookNoteDto,
  ): Promise<GuestbookResponseDto> {
    const newNote = {
      guestName: noteDto.guestName,
      guestNote: noteDto.guestNote,
    };

    const guestbook = await this.prisma.guestbook.upsert({
      where: { weddingId },
      update: {
        guestNotes: {
          push: newNote,
        },
      },
      create: {
        weddingId: weddingId,
        guestNotes: [newNote],
      },
    });

    return this.toGuestbookResponseDto(guestbook);
  }

  async getGuestbookByWeddingId(
    weddingId: number,
  ): Promise<GuestbookResponseDto> {
    const guestbook = await this.prisma.guestbook.findUnique({
      where: { weddingId },
    });

    if (!guestbook) {
      return {
        id: null,
        weddingId: weddingId,
        guestNotes: [],
      };
    }

    return this.toGuestbookResponseDto(guestbook);
  }

  async getGuestbookByGuestbookId(
    guestbookId: number,
  ): Promise<GuestbookResponseDto> {
    const guestbook = await this.prisma.guestbook.findUnique({
      where: { id: guestbookId },
    });

    if (!guestbook) {
      throw new NotFoundException(`Guestbook of ID ${guestbookId} not found.`);
    }

    return this.toGuestbookResponseDto(guestbook);
  }
}
