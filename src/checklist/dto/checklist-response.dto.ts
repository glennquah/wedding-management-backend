import { ApiProperty } from '@nestjs/swagger';
import { ChecklistItemResponseDto } from './checklist-item-response.dto';
import { ChatMessageResponseDto } from './chat-message-response.dto';

export class ChecklistResponseDto {
  @ApiProperty({ description: 'Unique identifier for the checklist' })
  id: number;

  @ApiProperty({ description: 'Wedding ID this checklist belongs to' })
  weddingId: number;

  @ApiProperty({
    description: 'Array of checklist items',
    type: [ChecklistItemResponseDto],
  })
  items: ChecklistItemResponseDto[];

  @ApiProperty({
    description: 'Chat history for this checklist',
    type: [ChatMessageResponseDto],
  })
  chatHistory: ChatMessageResponseDto[];

  @ApiProperty({
    description: 'Current stage of the checklist progression',
    enum: [
      'GETTING_STARTED',
      'INITIAL_PLANNING',
      'CREATING_THE_FOUNDATION',
      'DETAILED_PLANNING',
      'DURING_THE_WEDDING',
      'AFTER_THE_WEDDING',
      'ADDITIONAL_DETAILS',
      'CHECKLIST_GENERATED',
    ],
    example: 'GETTING_STARTED',
  })
  currentStage: string;

  @ApiProperty({ description: 'Date when the checklist was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the checklist was last updated' })
  updatedAt: Date;
}
