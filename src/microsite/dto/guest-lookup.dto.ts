import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GuestLookupDto {
  @ApiProperty({ description: 'Full name of the guest' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Microsite slug (e.g., "johnjenny")' })
  @IsString()
  @IsNotEmpty()
  micrositeSlug: string;
}
