import { ApiProperty } from '@nestjs/swagger';
import { ChecklistItemResponseDto } from './checklist-item-response.dto';

export class ChecklistResponseDto {
  @ApiProperty({ description: 'Unique identifier for the checklist' })
  id: number;

  @ApiProperty({ description: 'Wedding ID this checklist belongs to' })
  weddingId: number;

  @ApiProperty({ 
    description: 'Array of checklist items',
    type: [ChecklistItemResponseDto]
  })
  items: ChecklistItemResponseDto[];

  @ApiProperty({ description: 'Date when the checklist was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the checklist was last updated' })
  updatedAt: Date;
}