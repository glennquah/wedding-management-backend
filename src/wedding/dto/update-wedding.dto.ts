import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateWeddingDto {
  @ApiProperty({ description: 'The name of the wedding', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Wedding date', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Wedding location', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}