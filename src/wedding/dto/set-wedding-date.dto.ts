import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SetWeddingDateDto {
  @ApiProperty({
    description: 'ISO 8601 date string representing the wedding date',
    example: '2025-09-20',
  })
  @IsDateString()
  date: string;
}
