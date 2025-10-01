import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { AvailabilitySlotDto } from 'src/listing/dto/create-listing.dto';

export class AddToCartDto {
  @ApiProperty({
    description: 'Admin ID to associate with this cart',
    required: true,
  })
  @IsInt()
  adminId: number;

  @ApiProperty({
    description: 'Listing ID to add to this cart',
    required: true,
  })
  @IsInt()
  listingId: number;

  @ApiProperty({
    description: 'Selected time slot for the listing',
    type: [AvailabilitySlotDto],
    example: [
      {
        startTime: '2025-01-15T08:00:00Z',
        endTime: '2025-01-15T17:00:00Z',
        date: '2025-01-15',
      },
    ],
  })
  @IsArray()
  @Type(() => AvailabilitySlotDto)
  @ValidateNested({ each: true })
  selectedSlots: AvailabilitySlotDto[];
}
