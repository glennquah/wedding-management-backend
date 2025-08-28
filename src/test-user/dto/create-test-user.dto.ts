import { ApiProperty } from '@nestjs/swagger';

export class CreateTestUserDto {
  @ApiProperty({ description: 'The name of the test user' })
  name: string;
}
