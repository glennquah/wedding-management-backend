import { ConfirmationStatus, PrismaClient } from '@prisma/client';

export async function seedGuests(prisma: PrismaClient) {
  console.log('✅ Seeding guests...');

  const weddings = await prisma.wedding.findMany();

  const guestNames = [
    'Michael Chen',
    'Linda Chen',
    'James Chen',
    'Grace Chen',
    'Robert Lim',
    'Susan Lim',
    'Daniel Lim',
    'Michelle Lim',
    'Alex Johnson',
    'Sophie Williams',
    'Matt Brown',
    'Jessica Davis',
    'Chris Wilson',
    'Emma Thompson',
    'Jake Miller',
    'Olivia Garcia',
    'Ryan Murphy',
    'Hannah White',
    'Luke Anderson',
    'Chloe Martin',
    'Noah Jackson',
    'Ava Taylor',
    'Ethan Moore',
    'Isabella Clark',
    'Wei Zhang',
    'Mei Li',
    'Jin Wang',
    'Ling Liu',
    'Ahmad Hassan',
    'Fatimah Ibrahim',
    'Arjun Patel',
    'Kavya Singh',
    'Carlos Rodriguez',
    'Maria Gonzalez',
    'Pierre Dubois',
    'Marie Lefebvre',
    'Giovanni Rossi',
    'Francesca Ferrari',
  ];

  const allergies = ['None', 'Peanuts', 'Shellfish', 'Dairy', 'Gluten'];
  const groups = ['Family', 'Friends', 'Colleagues', 'Relatives'];

  let totalPrimaryGuests = 0;
  let totalAccompanyingGuests = 0;

  for (let i = 0; i < weddings.length; i++) {
    const wedding = weddings[i];

    // Special handling for wedding ID 2 (Glenn & Jes Chan's wedding)
    const isGlennJesWedding = wedding.id === 2;
    const primaryGuestCount = isGlennJesWedding ? 50 : 80;

    for (let j = 0; j < primaryGuestCount; j++) {
      let name =
        `${guestNames[j % guestNames.length]} ${j > guestNames.length ? j : ''}`.trim();

      // Add Ryan Tang as a special guest for Glenn & Jes wedding
      if (isGlennJesWedding && j === 0) {
        name = 'Ryan Tang';
      }

      // For Glenn & Jes wedding: all confirmed, half attended
      const confirmationStatus = isGlennJesWedding
        ? ConfirmationStatus.CONFIRMED
        : Math.random() > 0.2
          ? ConfirmationStatus.CONFIRMED
          : ConfirmationStatus.PENDING;

      const attendance = isGlennJesWedding ? j < 25 : false;

      // Create primary guest
      const primaryGuest = await prisma.guest.create({
        data: {
          name: name,
          email: `guest${i + 1}_${j + 1}@example.com`,
          allergies:
            Math.random() > 0.7
              ? allergies[Math.floor(Math.random() * allergies.length)]
              : null,
          group: groups[Math.floor(Math.random() * groups.length)],
          confirmationStatus: confirmationStatus,
          attendance: attendance,
          weddingId: wedding.id,
        },
      });

      totalPrimaryGuests++;

      // 30% chance to have accompanying guests (not for Glenn & Jes wedding for simplicity)
      if (!isGlennJesWedding && Math.random() < 0.3) {
        const numAccompanying = Math.floor(Math.random() * 3) + 1; // 1-3 accompanying guests

        for (let k = 0; k < numAccompanying; k++) {
          const accompanyingName = `${guestNames[(j + k + 1) % guestNames.length]} ${Math.floor(Math.random() * 100)}`;

          await prisma.guest.create({
            data: {
              name: accompanyingName.trim(),
              email: '', // Accompanying guests often don't have individual emails
              allergies:
                Math.random() > 0.6
                  ? allergies[Math.floor(Math.random() * allergies.length)]
                  : null,
              group: primaryGuest.group, // Same group as primary guest
              confirmationStatus:
                Math.random() > 0.3
                  ? ConfirmationStatus.CONFIRMED
                  : Math.random() > 0.5
                    ? ConfirmationStatus.PENDING
                    : ConfirmationStatus.REJECTED,
              weddingId: wedding.id,
              primaryGuestId: primaryGuest.id, // Link to primary guest
            },
          });

          totalAccompanyingGuests++;
        }
      }
    }

    console.log(
      `✅ Created ~${primaryGuestCount} primary guests ${!isGlennJesWedding ? 'with accompanying guests ' : ''}for ${wedding.name}`,
    );
  }

  console.log(`✅ Total primary guests: ${totalPrimaryGuests}`);
  console.log(`✅ Total accompanying guests: ${totalAccompanyingGuests}`);
  console.log(`✅ ~30% of primary guests have 1-3 accompanying guests each`);
  console.log(
    `✅ Accompanying guests have individual confirmation status and dietary requirements`,
  );
}
