import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistItemDto } from './create-checklist-item.dto';

export class CreateChecklistDto {
  @ApiProperty({ description: 'Wedding ID for the checklist' })
  @IsInt()
  weddingId: number;

  @ApiProperty({ 
    description: 'Array of checklist items',
    type: [CreateChecklistItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  items: CreateChecklistItemDto[];
}