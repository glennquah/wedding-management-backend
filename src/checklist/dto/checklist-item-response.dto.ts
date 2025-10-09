import { ApiProperty } from '@nestjs/swagger';

export class ChecklistItemResponseDto {
  @ApiProperty({ description: 'Unique identifier for the checklist item' })
  id: number;

  @ApiProperty({ description: 'Title of the checklist item' })
  title: string;

  @ApiProperty({ description: 'Description of the checklist item' })
  description: string;

  @ApiProperty({ description: 'Category of the checklist item' })
  category: string;

  @ApiProperty({ 
    description: 'Number of months before wedding to complete this item',
    nullable: true
  })
  monthsBeforeWedding: number | null;

  @ApiProperty({ description: 'Whether the item is completed' })
  completed: boolean;

  @ApiProperty({ description: 'Checklist ID this item belongs to' })
  checklistId: number;

  @ApiProperty({ description: 'Date when the item was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the item was last updated' })
  updatedAt: Date;
}