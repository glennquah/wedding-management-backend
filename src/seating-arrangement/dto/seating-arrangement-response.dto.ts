import { ApiProperty } from '@nestjs/swagger';

export class SeatingArrangementResponseDto {
  @ApiProperty({ description: 'Seating arrangement ID' })
  id: number;

  @ApiProperty({ description: 'Wedding ID' })
  weddingId: number;

  @ApiProperty({
    description: 'Group priorities mapping',
    required: false,
    example: { Family: 1, Friends: 2, Colleagues: 3 },
  })
  groupPriorities?: Record<string, number>;

  @ApiProperty({
    description:
      'Seating tables as array of arrays. Index 0 = Table 1, Index 1 = Table 2, etc.',
    type: [[String]],
    example: [
      ['John Doe', 'Jane Smith'],
      ['Bob Johnson', 'Alice Brown'],
    ],
  })
  tables: string[][];

  @ApiProperty({
    description: 'Number of tables per row in the layout',
    required: false,
    example: 4,
  })
  tablesPerRow?: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
