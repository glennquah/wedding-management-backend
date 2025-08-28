import { ApiProperty } from '@nestjs/swagger';

export class TestUserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the test user' })
  id: number;

  @ApiProperty({ description: 'The name of the test user' })
  name: string;

  @ApiProperty({ description: 'The date when the test user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the test user was last updated' })
  updatedAt: Date;
}
