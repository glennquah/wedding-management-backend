import { ApiProperty } from '@nestjs/swagger';

export class CollaboratorResponseDto {
  @ApiProperty({
    description: 'User ID of the collaborator',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the collaborator',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email of the collaborator',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Whether the account was newly created or existing',
    example: false,
  })
  accountCreated: boolean;

  @ApiProperty({
    description: 'Whether an existing account was found',
    example: true,
  })
  existingAccount: boolean;
}
