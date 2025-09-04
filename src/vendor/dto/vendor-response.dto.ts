import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class VendorResponseDto extends UserResponseDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  vendorWebsite?: string;

  @ApiProperty({ description: 'Unique Entity Number (UEN) of the vendor', required: false })
  uenNumber?: string;

  @ApiProperty({ description: 'Date when the vendor was onboarded', required: false })
  onboardedDate?: Date;
}
