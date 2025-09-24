import { ApiProperty } from '@nestjs/swagger';
import { TableDto } from './table.dto';

export class LayoutConfigDto {
  @ApiProperty({
    description: 'Array of tables in the layout',
    type: [TableDto],
  })
  tables: TableDto[];
}