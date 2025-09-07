import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

export class TestUserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the test user' })
  id: number;

  @ApiProperty({ description: 'The name of the test user' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the test user' })
  email: string;

  @ApiProperty({ description: 'The date when the test user was created' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the test user was last updated' })
  @IsDate()
  updatedAt: Date;
}
