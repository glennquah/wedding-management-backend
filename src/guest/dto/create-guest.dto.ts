import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ConfirmationStatus } from '../../common/confirmation-status.enum';

export class CreateGuestDto {
  @ApiProperty({ description: 'The name of the guest' })
  @IsString()
  name: string;

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

  @ApiProperty({ description: 'Wedding ID this guest belongs to' })
  @IsInt()
  weddingId: number;

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
    required: false,
    default: ConfirmationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ConfirmationStatus)
  confirmationStatus?: ConfirmationStatus;
}
