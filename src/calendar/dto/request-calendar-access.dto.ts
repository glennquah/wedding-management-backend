import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RequestCalendarAccessDto {
  @ApiProperty({
    description: 'The ID of the collaborator to request calendar access from',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  collaboratorId: number;

  @ApiProperty({
    description: 'The ID of the wedding',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  weddingId: number;
}
