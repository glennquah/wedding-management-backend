import { PrismaClient, Wedding } from '@prisma/client';

export async function seedAlbums(prisma: PrismaClient, weddings: Wedding[]) {
  console.log('✅ Seeding albums...');

  if (!weddings.length) {
    console.warn('⚠️ No weddings available for album seeding. Skipping.');
    return;
  }

  const mainWedding = weddings[0];

  await prisma.album.create({
    data: {
      weddingId: mainWedding.id,
      coupleName: 'Tom & Jerry',
      inviteCardMessage: 'Join us as we celebrate our special day!',
      landingMessage:
        'Welcome to our wedding album! Relive the magical moments with us.',
      albumURL: '/microsite/tom-and-jerry-wedding/album',
      photos: [],
    },
  });

  console.log('✅ Created album for Tom & Jerry wedding');

  // Create album for Glenn & Jes Chan's wedding (wedding ID 2)
  if (weddings.length > 1) {
    const glennJesWedding = weddings[1];

    await prisma.album.create({
      data: {
        weddingId: glennJesWedding.id,
        coupleName: 'Glenn & Jes Chan',
        inviteCardMessage: 'Join us for our traditional Chinese tea ceremony!',
        landingMessage:
          'Welcome to our wedding album! Share in our joy and happiness.',
        albumURL: '/microsite/glenn-and-jes-wedding/album',
        photos: [],
      },
    });

    console.log('✅ Created album for Glenn & Jes Chan wedding');
  }
}
