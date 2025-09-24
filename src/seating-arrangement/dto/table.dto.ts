import { ApiProperty } from '@nestjs/swagger';

export class TableDto {
  @ApiProperty({
    description: 'Table ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'X coordinate position',
    example: 100,
  })
  x: number;

  @ApiProperty({
    description: 'Y coordinate position',
    example: 150,
  })
  y: number;

  @ApiProperty({
    description: 'Table size/type',
    example: 8,
  })
  size: number;

  @ApiProperty({
    description: 'Table capacity (number of seats)',
    example: 8,
  })
  capacity: number;

  @ApiProperty({
    description: 'Table name/label',
    example: 'Table 1',
  })
  name: string;
}
