import { PrismaClient, Wedding } from '@prisma/client';

const MICROSITE_IMAGE_URL =
  'https://res.cloudinary.com/dnyxxyolp/image/upload/v1760453186/brwnonzl72jen6gsdfzd.jpg';

export async function seedMicrosites(
  prisma: PrismaClient,
  weddings: Wedding[],
) {
  console.log('✅ Seeding microsites...');

  if (!weddings.length) {
    console.warn('⚠️ No weddings available for microsite seeding. Skipping.');
    return;
  }

  const mainWedding = weddings[0];

  await prisma.microsite.create({
    data: {
      templateNumber: 1,
      slug: 'tom-and-jerry-wedding',
      coupleName: 'Tom & Jerry',
      heroImages: [MICROSITE_IMAGE_URL],
      imageGallery: [MICROSITE_IMAGE_URL],
      schedule: [
        {
          time: '1:30 PM',
          title: 'Guest Arrival & Welcome Drinks',
          description:
            'Arrive early for refreshing spritzers and a personalised welcome.',
        },
        {
          time: '2:00 PM',
          title: 'Garden Ceremony',
          description:
            'Celebrate with us as we exchange vows in the enchanted garden.',
        },
        {
          time: '4:00 PM',
          title: 'Dinner & Dancing',
          description:
            'Enjoy a curated menu and live band in the Marina Bay Grand Ballroom.',
        },
      ],
      faqs: [
        {
          q: 'What is the dress code?',
          a: 'Formal attire with a touch of garden party flair.',
        },
        {
          q: 'Is parking available?',
          a: 'Complimentary parking is available at Marina Bay Grand Ballroom.',
        },
      ],
      password: 'password',
      wedding: {
        connect: { id: mainWedding.id },
      },
    },
  });

  console.log('✅ Created microsite for couple@wedding.com wedding');
}
