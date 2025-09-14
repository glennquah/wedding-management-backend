import { ApiProperty } from '@nestjs/swagger';

export class WeddingDetailsDto {
  @ApiProperty({ description: 'Wedding ID' })
  id: number;

  @ApiProperty({ description: 'The name of the wedding' })
  name: string;
}
