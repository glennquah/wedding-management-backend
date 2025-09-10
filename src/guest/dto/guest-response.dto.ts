import { ApiProperty } from '@nestjs/swagger';
import { ConfirmationStatus } from '../../common/confirmation-status.enum';

export class GuestResponseDto {
  @ApiProperty({ description: 'Guest ID' })
  id: number;

  @ApiProperty({ description: 'The name of the guest' })
  name: string;

  @ApiProperty({
    description: 'Allergies or dietary restrictions',
    required: false,
  })
  allergies?: string;

  @ApiProperty({
    description: 'Group identifier for the guest',
    required: false,
  })
  group?: string;

  @ApiProperty({ description: 'Wedding ID this guest belongs to' })
  weddingId: number;

  @ApiProperty({
    description: 'Primary guest ID if this is an accompanying guest',
    required: false,
  })
  primaryGuestId?: number;

  @ApiProperty({
    description: 'Confirmation status of the guest',
    enum: ConfirmationStatus,
    default: ConfirmationStatus.PENDING,
  })
  confirmationStatus: ConfirmationStatus;

  @ApiProperty({
    description: 'List of accompanying guests',
    type: [GuestResponseDto],
    required: false,
  })
  accompanyingGuests?: GuestResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
