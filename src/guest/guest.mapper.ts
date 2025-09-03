import { Guest } from '@prisma/client';
import { GuestResponseDto } from './dto/guest-response.dto';

type GuestWithAccompanying = Guest & {
  accompanyingGuests?: Guest[];
};

export function toGuestResponseDto(guest: GuestWithAccompanying): GuestResponseDto {
  return {
    id: guest.id,
    name: guest.name,
    allergies: guest.allergies,
    group: guest.group,
    confirmationStatus: guest.confirmationStatus,
    weddingId: guest.weddingId,
    primaryGuestId: guest.primaryGuestId,
    accompanyingGuests: guest.accompanyingGuests?.map(toGuestResponseDto),
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };
}