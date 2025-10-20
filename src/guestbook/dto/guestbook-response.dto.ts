import { ApiProperty } from '@nestjs/swagger';

class GuestbookNoteDto {
  @ApiProperty({
    description: 'Guest name',
    example: 'Ryan Tulane Tang',
  })
  guestName: string;

  @ApiProperty({
    description: 'Guest Note',
    example: 'Wonderful night!',
  })
  guestNote: string;
}

export class GuestbookResponseDto {
  @ApiProperty({ description: 'Microsite ID' })
  id: number;

  @ApiProperty({ description: 'Wedding ID' })
  weddingId: number;

  @ApiProperty({
    description: 'Guestbook notes',
    required: false,
    type: [GuestbookNoteDto],
  })
  guestNotes?: GuestbookNoteDto[];
}
