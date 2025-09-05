import { Wedding, Guest } from '@prisma/client';
import { WeddingResponseDto } from './dto/wedding-response.dto';
import { toGuestResponseDto } from '../guest/guest.mapper';

type WeddingWithGuests = Wedding & {
  guests?: Guest[];
};

export function toWeddingResponseDto(wedding: WeddingWithGuests): WeddingResponseDto {
  return {
    id: wedding.id,
    name: wedding.name,
    date: wedding.date.toISOString(),
    location: wedding.location,
    guests: wedding.guests?.map(toGuestResponseDto),
    createdAt: wedding.createdAt.toISOString(),
    updatedAt: wedding.updatedAt.toISOString(),
  };
}