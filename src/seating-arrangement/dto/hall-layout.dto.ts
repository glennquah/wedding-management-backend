import { ApiProperty } from '@nestjs/swagger';
import { LayoutConfigDto } from './layout-config.dto';

export class HallLayoutDto {
  @ApiProperty({
    description: 'Layout configuration data from FastAPI',
    type: LayoutConfigDto,
  })
  layout: LayoutConfigDto;

  @ApiProperty({
    description: 'Guest count bucket this layout is for',
    example: 'MEDIUM',
  })
  guest_count_bucket: string;

  @ApiProperty({
    description: 'Additional metadata about the layout',
    required: false,
  })
  metadata?: Record<string, any>;
}