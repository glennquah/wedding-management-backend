import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateChecklistItemDto {
  @ApiProperty({ description: 'Title of the checklist item' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the checklist item' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Category of the checklist item' })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Number of months before wedding to complete this item',
    required: false,
  })
  @IsOptional()
  @IsInt()
  monthsBeforeWedding?: number;

  @ApiProperty({
    description: 'Whether the item is completed',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
