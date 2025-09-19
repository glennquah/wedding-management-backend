import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MicrositeLoginDto {
  @ApiProperty({ description: 'Slug of the microsite' })
  @IsString()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Password to access microsite' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
