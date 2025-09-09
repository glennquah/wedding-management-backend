import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateWeddingDto {
  @ApiProperty({ description: 'The name of the wedding' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Wedding date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
