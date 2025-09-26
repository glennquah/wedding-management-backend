import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GuestCountBucket } from '../../common/guest-count-bucket.enum';

export class SeatingGuestDto {
  @ApiProperty({ description: 'Guest name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Guest group identifier', example: 'family' })
  @IsNotEmpty()
  @IsString()
  group: string;

  @ApiProperty({
    description: 'Optional list of plus ones that must sit with this guest',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plus_ones?: string[];
}

export class SeatingRequestDto {
  @ApiProperty({
    description: 'Detailed guest records used for optimization',
    type: [SeatingGuestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatingGuestDto)
  guests: SeatingGuestDto[];

  @ApiProperty({
    description: 'Guest count bucket determining layout selection',
    enum: GuestCountBucket,
    enumName: 'GuestCountBucket',
  })
  @IsNotEmpty()
  @IsEnum(GuestCountBucket)
  guest_count_bucket: GuestCountBucket;

  @ApiProperty({
    description: 'Mapping of groups to their priorities',
    example: { family: 5, friends: 3 },
  })
  @IsNotEmpty()
  @IsObject()
  group_priorities: Record<string, number>;

  @ApiProperty({
    description: 'Number of tables per row for layout selection',
    required: false,
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  tables_per_row?: number;
}
