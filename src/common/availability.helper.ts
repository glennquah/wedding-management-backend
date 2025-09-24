/**
 * Helper functions for handling JSON availabilities in listings
 */

/**
 * Parse availabilities from JSON to Date array
 * Handles various input formats: JSON string, array of dates/strings, etc.
 */
export function parseAvailabilities(availabilities: any): Date[] {
  if (!availabilities) return [];

  // If it's already an array
  if (Array.isArray(availabilities)) {
    return availabilities.map((date) => {
      if (date instanceof Date) return date;
      return new Date(date);
    });
  }

  // If it's a JSON string, parse it first
  try {
    const parsed =
      typeof availabilities === 'string'
        ? JSON.parse(availabilities)
        : availabilities;

    if (Array.isArray(parsed)) {
      return parsed.map((date) => new Date(date));
    }
  } catch (error) {
    console.error('Error parsing availabilities:', error);
  }

  return [];
}

/**
 * Convert Date array back to JSON format for storage
 * Returns an array of ISO date strings
 */
export function serializeAvailabilities(dates: Date[]): string[] {
  return dates.map((date) => date.toISOString());
}

/**
 * Check if a requested date is available in the availabilities array
 */
export function isDateAvailable(
  requestedDate: Date,
  availabilities: any,
): boolean {
  const availableDates = parseAvailabilities(availabilities);
  return availableDates.some(
    (availableDate) => availableDate.getTime() === requestedDate.getTime(),
  );
}

/**
 * Remove booked dates from availabilities and return updated array
 */
export function removeBookedDates(
  availabilities: any,
  bookedDates: Date[],
): string[] {
  const availableDates = parseAvailabilities(availabilities);

  const updatedDates = availableDates.filter(
    (availableDate) =>
      !bookedDates.some(
        (bookedDate) => bookedDate.getTime() === availableDate.getTime(),
      ),
  );

  return serializeAvailabilities(updatedDates);
}

/**
 * Add dates back to availabilities (for cancellations/restorations)
 */
export function addDatesToAvailabilities(
  availabilities: any,
  datesToAdd: Date[],
): string[] {
  const availableDates = parseAvailabilities(availabilities);

  // Combine existing and new dates
  const allDates = [...availableDates, ...datesToAdd];

  // Remove duplicates and sort
  const uniqueDates = Array.from(
    new Set(allDates.map((date) => date.getTime())),
  )
    .map((time) => new Date(time))
    .sort();

  return serializeAvailabilities(uniqueDates);
}
