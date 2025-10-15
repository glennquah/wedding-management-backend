import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateMicrositeDto {
  @ApiProperty({
    description: 'Couple name for the microsite',
    example: 'John & Jane',
  })
  @IsString()
  @IsNotEmpty()
  coupleName: string;

  @ApiProperty({
    description: 'Wedding ID to get context from',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  weddingId: number;

  @ApiProperty({
    description: 'Preferred theme or style for the microsite',
    example: 'Modern & Minimalist',
    required: false,
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({
    description: 'Additional context or requirements for microsite generation',
    example: 'We love outdoor photography and nature-themed decorations',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalContext?: string;
}
