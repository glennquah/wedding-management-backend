import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateVendorDto extends CreateUserDto {
  @ApiProperty({ description: 'Vendor website URL', required: false })
  @IsOptional()
  @IsString()
  vendorWebsite?: string;

  @ApiProperty({ description: 'Unique Entity Number (UEN) of the vendor', required: false })
  @IsOptional()
  @IsString()
  uenNumber?: string;

  @ApiProperty({ description: 'Date when the vendor was onboarded', required: false })
  @IsOptional()
  @IsDateString()
  onboardedDate?: string;
}
