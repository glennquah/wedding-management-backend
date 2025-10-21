import { ApiProperty } from '@nestjs/swagger';

export class ProcessingStatusDto {
  @ApiProperty({
    description: 'Total number of photos in the album',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of photos pending processing',
    example: 10,
  })
  pending: number;

  @ApiProperty({
    description: 'Number of photos currently being processed',
    example: 5,
  })
  processing: number;

  @ApiProperty({
    description: 'Number of photos successfully processed',
    example: 80,
  })
  completed: number;

  @ApiProperty({
    description: 'Number of photos that failed processing',
    example: 5,
  })
  failed: number;

  @ApiProperty({
    description: 'Processing completion percentage',
    example: 85.0,
  })
  percentage: number;
}
