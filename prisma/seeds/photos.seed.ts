import { PrismaClient, ProcessingStatus } from '@prisma/client';

export async function seedPhotos(prisma: PrismaClient) {
  console.log('✅ Seeding photos and face detections...');

  // Get wedding ID 2 (Glenn & Jes Chan's wedding)
  const wedding = await prisma.wedding.findUnique({
    where: { id: 2 },
    include: { album: true },
  });

  if (!wedding || !wedding.album) {
    console.log('⚠️ Wedding ID 2 or its album not found, skipping photos seed');
    return;
  }

  const album = wedding.album;

  // Get all guests for face clustering
  const guests = await prisma.guest.findMany({
    where: { weddingId: wedding.id },
    take: 10, // We'll use first 10 guests as persons who appear in photos
  });

  // Sample photo URLs (using placeholder images)
  const photoUrls = [
    'https://images.unsplash.com/photo-1519741497674-611481863552',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486',
    'https://images.unsplash.com/photo-1505533321630-975218a5f66f',
    'https://images.unsplash.com/photo-1525258437537-0f2a87579fee',
  ];

  // Create 40 photos
  const photoCount = 40;
  const photos = [];

  for (let i = 0; i < photoCount; i++) {
    const photoUrl = `${photoUrls[i % photoUrls.length]}?wedding=2&photo=${i}`;

    const photo = await prisma.photo.create({
      data: {
        url: photoUrl,
        albumId: album.id,
        processingStatus: ProcessingStatus.COMPLETED,
        processedAt: new Date(),
        isBlurry: Math.random() > 0.9, // 10% chance of being blurry
        blurScore: Math.random() * 1000 + 500,
      },
    });

    photos.push(photo);
  }

  console.log(`✅ Created ${photoCount} photos`);

  // Create person clusters (one for each guest + special cluster for Ryan Tang who appears most)
  const personClusters = [];

  // Generate a simple mock encoding for face recognition
  const generateMockEncoding = () => {
    return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
  };

  // Create person cluster for Ryan Tang (he appears the most)
  const ryanTangCluster = await prisma.personCluster.create({
    data: {
      albumId: album.id,
      label: 'Ryan Tang',
      representativeEncoding: generateMockEncoding(),
      thumbnailUrl: photos[0].url,
    },
  });
  personClusters.push(ryanTangCluster);

  // Create clusters for other guests
  for (let i = 1; i < Math.min(guests.length, 10); i++) {
    const cluster = await prisma.personCluster.create({
      data: {
        albumId: album.id,
        label: guests[i].name,
        representativeEncoding: generateMockEncoding(),
        thumbnailUrl: photos[i % photos.length].url,
      },
    });
    personClusters.push(cluster);
  }

  console.log(`✅ Created ${personClusters.length} person clusters`);

  // Create 50 face detections across the 40 photos
  // Ryan Tang appears in 15 photos (most frequently)
  let totalFaces = 0;

  // Ryan Tang appears in first 15 photos
  for (let i = 0; i < 15; i++) {
    await prisma.photoFace.create({
      data: {
        photoId: photos[i].id,
        encoding: generateMockEncoding(),
        x: Math.random() * 0.5,
        y: Math.random() * 0.5,
        width: 0.2 + Math.random() * 0.1,
        height: 0.2 + Math.random() * 0.1,
        personClusterId: ryanTangCluster.id,
      },
    });
    totalFaces++;
  }

  // Distribute remaining 35 faces among other person clusters and photos
  const remainingFaces = 35;
  for (let i = 0; i < remainingFaces; i++) {
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    const randomCluster =
      personClusters[Math.floor(Math.random() * personClusters.length)];

    await prisma.photoFace.create({
      data: {
        photoId: randomPhoto.id,
        encoding: generateMockEncoding(),
        x: Math.random() * 0.5,
        y: Math.random() * 0.5,
        width: 0.2 + Math.random() * 0.1,
        height: 0.2 + Math.random() * 0.1,
        personClusterId: randomCluster.id,
      },
    });
    totalFaces++;
  }

  console.log(`✅ Created ${totalFaces} face detections`);
  console.log(`✅ Ryan Tang appears in 15 photos (most frequently)`);

  // Update album with legacy photo URLs for backward compatibility
  await prisma.album.update({
    where: { id: album.id },
    data: {
      photos: photos.map((p) => p.url),
    },
  });

  console.log(`✅ Updated album with photo URLs`);
}
