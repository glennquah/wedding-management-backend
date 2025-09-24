import { ApiProperty } from '@nestjs/swagger';

export class SeatingResultDto {
  @ApiProperty({
    description: 'Whether the optimization was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Seating optimization completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Mapping of table numbers to guest lists',
    example: { '1': ['John Doe', 'Jane Smith'], '2': ['Bob Johnson'] },
    required: false,
  })
  seating_arrangement?: Record<string, string[]>;

  @ApiProperty({
    description: 'List of constraint violations, if any',
    example: ['Guest A and Guest B cannot sit together'],
    required: false,
  })
  violated_constraints?: string[];
}
