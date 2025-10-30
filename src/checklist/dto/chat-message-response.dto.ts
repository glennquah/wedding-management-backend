import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the chat message',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['assistant', 'user'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Content of the chat message',
    example: 'Can you help me plan my wedding timeline?',
  })
  content: string;

  @ApiProperty({
    description: 'ID of the checklist this message belongs to',
  })
  checklistId: number;

  @ApiProperty({
    description: 'Date when the message was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the message was last updated',
  })
  updatedAt: Date;
}
