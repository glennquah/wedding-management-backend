import { ApiProperty } from '@nestjs/swagger';

export class CategoryStatsDto {
  @ApiProperty({
    description: 'Total number of items in category',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Number of completed items in category',
    example: 7,
  })
  completed: number;

  @ApiProperty({
    description: 'Completion percentage for category',
    example: 70,
  })
  percentage: number;
}

export class ChecklistStatsResponseDto {
  @ApiProperty({
    description: 'Total number of items in checklist',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Number of completed items in checklist',
    example: 18,
  })
  completed: number;

  @ApiProperty({
    description: 'Overall completion percentage',
    example: 72,
  })
  percentage: number;

  @ApiProperty({
    description: 'Statistics broken down by category',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        completed: { type: 'number' },
        percentage: { type: 'number' },
      },
    },
    example: {
      'Getting Started': { total: 5, completed: 5, percentage: 100 },
      'Initial Planning': { total: 10, completed: 7, percentage: 70 },
      'Detailed Planning': { total: 10, completed: 6, percentage: 60 },
    },
  })
  byCategory: Record<string, CategoryStatsDto>;
}
