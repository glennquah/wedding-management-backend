import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ConfirmationStatus } from '../../common/confirmation-status.enum';

export class UpdateGuestDto {
  @ApiProperty({ description: 'The name of the guest', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The email of the guest', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Allergies or dietary restrictions',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    description: 'Group identifier for the guest',
    required: false,
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({
    description: 'Primary guest ID if this is an accompanying guest',
    required: false,
  })
  @IsOptional()
  @IsInt()
  primaryGuestId?: number;

  @ApiProperty({
    description: 'Confirmation status of the guest',
    enum: ConfirmationStatus,
    enumName: "ConfirmationStatus",
    required: false,
  })
  @IsOptional()
  @IsEnum(ConfirmationStatus)
  confirmationStatus?: ConfirmationStatus;
}
