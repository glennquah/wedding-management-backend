import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InviteCollaboratorDto {
  @ApiProperty({
    description: 'Guest ID to invite as collaborator',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  guestId: number;

  @ApiProperty({
    description: 'Email of the guest being invited',
    example: 'guest@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Name of the guest being invited',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Wedding ID to add as collaborator',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  weddingId: number;
}
