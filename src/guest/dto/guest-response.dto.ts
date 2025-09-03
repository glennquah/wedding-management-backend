import { ApiProperty } from '@nestjs/swagger';

export class GuestResponseDto {
  @ApiProperty({ description: 'Guest ID' })
  id: number;

  @ApiProperty({ description: 'The name of the guest' })
  name: string;

  @ApiProperty({ description: 'Allergies or dietary restrictions', required: false })
  allergies?: string;

  @ApiProperty({ description: 'Group identifier for the guest', required: false })
  group?: string;

  @ApiProperty({ description: 'Wedding ID this guest belongs to' })
  weddingId: number;

  @ApiProperty({ description: 'Primary guest ID if this is an accompanying guest', required: false })
  primaryGuestId?: number;

  @ApiProperty({ 
    description: 'Confirmation status of the guest', 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  })
  confirmationStatus: 'pending' | 'confirmed' | 'rejected';

  @ApiProperty({ description: 'List of accompanying guests', type: [GuestResponseDto], required: false })
  accompanyingGuests?: GuestResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}