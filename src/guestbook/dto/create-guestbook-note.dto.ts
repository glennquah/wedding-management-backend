import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGuestbookNoteDto {
  @ApiProperty({
    description: 'Guest name',
    example: 'Ryan Tulane Tang',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  guestName: string;

  @ApiProperty({
    description: 'Guest Note',
    example: 'Wonderful night!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  guestNote: string;
}
