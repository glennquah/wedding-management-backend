import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CreateSeatingArrangementDto {
  @ApiProperty({
    description: 'Group priorities mapping',
    required: false,
    example: { Family: 1, Friends: 2, Colleagues: 3 },
  })
  @IsOptional()
  @IsObject()
  groupPriorities?: Record<string, number>;

  @ApiProperty({
    description:
      'Seating tables as array of arrays. Index 0 = Table 1, Index 1 = Table 2, etc.',
    required: false,
    example: [
      ['John Doe', 'Jane Smith'],
      ['Bob Johnson', 'Alice Brown'],
    ],
    type: [[String]],
  })
  @IsOptional()
  @IsArray()
  tables?: string[][];

  @ApiProperty({
    description: 'Number of tables per row in the layout',
    required: false,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  tablesPerRow?: number;
}
