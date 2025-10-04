import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { OptimizeDateResponseDto } from '../../calendar/dto/date-optimization.dto';

export class DateOptimizerPreferencesDto {
  @ApiProperty({
    description: 'Earliest date for wedding date optimization',
    required: false,
  })
  @IsOptional()
  @IsString()
  earliestDate?: string;

  @ApiProperty({
    description: 'Latest date for wedding date optimization',
    required: false,
  })
  @IsOptional()
  @IsString()
  latestDate?: string;

  @ApiProperty({
    description: 'Preferred days of the week',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDays?: string[];

  @ApiProperty({
    description: 'Last analysis results from AI optimizer',
    required: false,
    type: () => OptimizeDateResponseDto,
  })
  @IsOptional()
  lastResults?: OptimizeDateResponseDto;
}
