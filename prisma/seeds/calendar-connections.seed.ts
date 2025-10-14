import { PrismaClient } from '@prisma/client';

export async function seedCalendarConnections(prisma: PrismaClient) {
  console.log('✅ Seeding Google Calendar connections...');

  const weddings = await prisma.wedding.findMany({
    include: {
      mainCouple: {
        include: {
          user: true,
        },
      },
    },
  });

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  let totalCalendarConnections = 0;

  for (const wedding of weddings) {
    // Create mock Google Calendar connections for main couple (using their user IDs, which maps to Admin.userId)
    if (wedding.mainCouple && wedding.mainCouple.length >= 2) {
      const partner1 = wedding.mainCouple[0];
      const partner2 = wedding.mainCouple[1];

      await prisma.googleCalendarConnection.create({
        data: {
          adminId: partner1.userId,
          accessToken: `mock_access_token_admin_${partner1.userId}`,
          refreshToken: `mock_refresh_token_admin_${partner1.userId}`,
          tokenExpiry: oneYearFromNow,
          email: partner1.user.email,
          accessStatus: 'CONNECTED',
        },
      });
      totalCalendarConnections++;

      await prisma.googleCalendarConnection.create({
        data: {
          adminId: partner2.userId,
          accessToken: `mock_access_token_admin_${partner2.userId}`,
          refreshToken: `mock_refresh_token_admin_${partner2.userId}`,
          tokenExpiry: oneYearFromNow,
          email: partner2.user.email,
          accessStatus: 'CONNECTED',
        },
      });
      totalCalendarConnections++;

      // Add key attendees to wedding (pick 5 existing guests with emails, excluding main couple)
      const mainCoupleGuests = await prisma.guest.findMany({
        where: {
          weddingId: wedding.id,
          email: {
            in: [partner1.user.email, partner2.user.email],
          },
        },
      });

      const weddingGuests = await prisma.guest.findMany({
        where: {
          weddingId: wedding.id,
          email: { not: '' },
          id: {
            notIn: mainCoupleGuests.map((g) => g.id),
          },
        },
        take: 5,
      });

      // Create mock calendar connections for key attendees
      for (const guest of weddingGuests) {
        await prisma.googleCalendarConnection.create({
          data: {
            guestId: guest.id,
            accessToken: `mock_access_token_guest_${guest.id}`,
            refreshToken: `mock_refresh_token_guest_${guest.id}`,
            tokenExpiry: oneYearFromNow,
            email: guest.email,
            accessStatus: 'CONNECTED',
          },
        });
        totalCalendarConnections++;
      }

      // Update wedding with key attendee IDs (using guest IDs)
      await prisma.wedding.update({
        where: { id: wedding.id },
        data: {
          keyAttendeeIds: weddingGuests.map((g) => g.id),
        },
      });

      console.log(
        `✅ Added main couple + ${weddingGuests.length} key attendees with mock calendar connections for ${wedding.name}`,
      );
    }
  }

  console.log(
    `✅ Created ${totalCalendarConnections} Google Calendar connections`,
  );
}
