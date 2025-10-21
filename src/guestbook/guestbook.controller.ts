import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { CreateGuestbookNoteDto } from './dto/create-guestbook-note.dto';
import { GuestbookResponseDto } from './dto/guestbook-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('guestbook')
@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Post(':weddingId/add')
  @ApiOperation({ summary: 'Create guestbook for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'Guestbook created successfully.',
    type: GuestbookResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Wedding already has a guestbook.',
  })
  addGuestNote(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() createGuestbookNoteDto: CreateGuestbookNoteDto,
  ): Promise<GuestbookResponseDto> {
    return this.guestbookService.addNote(weddingId, createGuestbookNoteDto);
  }

  @Get(':weddingId')
  @ApiOperation({ summary: 'Get guestbook by wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Guestbook retrieved successfully.',
    type: GuestbookResponseDto,
  })
  getGuestbookByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<GuestbookResponseDto> {
    return this.guestbookService.getGuestbookByWeddingId(weddingId);
  }

  @Get(':guestbookId')
  @ApiOperation({ summary: 'Get guestbook by guestbook ID' })
  @ApiResponse({
    status: 200,
    description: 'Guestbook retrieved successfully.',
    type: GuestbookResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Guestbook not found.' })
  getGuestbookByGuestbookId(
    @Param('guestbookId', ParseIntPipe) guestbookId: number,
  ): Promise<GuestbookResponseDto> {
    return this.guestbookService.getGuestbookByGuestbookId(guestbookId);
  }
}
