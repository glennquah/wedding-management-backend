import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsInt,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export interface ScoreBreakdown {
  key_attendee_availability: number;
  day_of_week: number;
}

export class AttendeeUnavailabilityDto {
  @ApiProperty({ description: 'Attendee ID' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Attendee name' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'List of unavailable dates in ISO format (YYYY-MM-DD)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  unavailable_dates: string[];

  @ApiProperty({
    description: 'Whether this person is part of the main couple',
    default: false,
  })
  @IsBoolean()
  is_main_couple: boolean;
}

export class OptimizeDateRequestDto {
  @ApiProperty({
    description: 'Start date for search window (YYYY-MM-DD)',
    example: '2025-06-01',
  })
  @IsString()
  start_date: string;

  @ApiProperty({
    description: 'End date for search window (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsString()
  end_date: string;

  @ApiProperty({
    description: 'Main couple unavailable dates (highest priority)',
    type: [AttendeeUnavailabilityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeUnavailabilityDto)
  main_couple_unavailability: AttendeeUnavailabilityDto[];

  @ApiProperty({
    description: 'Key attendees unavailable dates',
    type: [AttendeeUnavailabilityDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeUnavailabilityDto)
  @IsOptional()
  key_attendees_unavailability?: AttendeeUnavailabilityDto[];

  @ApiProperty({
    description: 'Preferred days of the week, ordered by preference',
    type: [String],
    example: ['Saturday', 'Friday', 'Sunday'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferred_days?: string[];

  @ApiProperty({
    description: 'Number of top recommendations to return',
    default: 5,
    required: false,
  })
  @IsInt()
  @IsOptional()
  top_n?: number;
}

export class DateRecommendationDto {
  @ApiProperty({ description: 'Recommended date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ description: 'Day of the week' })
  day_of_week: string;

  @ApiProperty({ description: 'Overall desirability score (0-100)' })
  total_score: number;

  @ApiProperty({
    description: 'Breakdown of scores by factor',
    example: {
      key_attendee_availability: 63.0,
      day_of_week: 30.0,
    },
  })
  score_breakdown: ScoreBreakdown;

  @ApiProperty({ description: 'Number of key attendees available' })
  available_attendees_count: number;

  @ApiProperty({
    description: 'Total number of key attendees (excluding main couple)',
  })
  total_attendees_count: number;

  @ApiProperty({
    description: 'Names of unavailable key attendees',
    type: [String],
  })
  unavailable_attendees: string[];

  @ApiProperty({ description: 'Advantages of this date', type: [String] })
  pros: string[];

  @ApiProperty({ description: 'Disadvantages of this date', type: [String] })
  cons: string[];
}

export class OptimizeDateResponseDto {
  @ApiProperty({ description: 'Whether optimization succeeded' })
  success: boolean;

  @ApiProperty({ description: 'Status message' })
  message: string;

  @ApiProperty({
    description: 'List of recommended dates, ordered by score',
    type: [DateRecommendationDto],
    required: false,
  })
  recommendations?: DateRecommendationDto[];

  @ApiProperty({
    description: 'Total number of candidate dates analyzed',
    required: false,
  })
  total_candidates?: number;

  @ApiProperty({
    description: 'Number of viable dates (after filtering couple conflicts)',
    required: false,
  })
  viable_dates?: number;
}
