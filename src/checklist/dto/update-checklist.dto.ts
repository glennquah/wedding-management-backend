import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistDto } from './create-checklist.dto';
import { CreateChecklistItemDto } from './create-checklist-item.dto';

export class UpdateChecklistDto extends PartialType(CreateChecklistDto) {
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
    required: false,
    example: 'GETTING_STARTED',
  })
  @IsOptional()
  @IsEnum([
    'GETTING_STARTED',
    'INITIAL_PLANNING',
    'CREATING_THE_FOUNDATION',
    'DETAILED_PLANNING',
    'DURING_THE_WEDDING',
    'AFTER_THE_WEDDING',
    'ADDITIONAL_DETAILS',
    'CHECKLIST_GENERATED',
  ])
  currentStage?: string;

  @ApiProperty({
    description: 'Complete array of checklist items to replace existing items',
    type: [CreateChecklistItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  items?: CreateChecklistItemDto[];

  @ApiProperty({
    description:
      'Whether to append chat messages to existing history (true) or replace all chat history (false). Defaults to false.',
    required: false,
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  appendChatHistory?: boolean;
}
