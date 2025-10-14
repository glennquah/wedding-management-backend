import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistItemDto } from './create-checklist-item.dto';

export class CreateChatMessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['assistant', 'user'],
    example: 'assistant',
  })
  @IsEnum(['assistant', 'user'])
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Content of the chat message',
    example: 'Welcome to your wedding planning journey!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateChecklistDto {
  @ApiProperty({ description: 'Wedding ID for the checklist' })
  @IsInt()
  weddingId: number;

  @ApiProperty({
    description: 'Array of checklist items',
    type: [CreateChecklistItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  items: CreateChecklistItemDto[];

  @ApiProperty({
    description: 'Initial chat messages for the checklist',
    type: [CreateChatMessageDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateChatMessageDto)
  chatHistory?: CreateChatMessageDto[];
}
