import { PrismaClient } from '@prisma/client';

export async function seedGuestbook(prisma: PrismaClient) {
  console.log('✅ Seeding guestbook well wishes...');

  // Get wedding ID 2 (Glenn & Jes Chan's wedding)
  const wedding = await prisma.wedding.findUnique({
    where: { id: 2 },
  });

  if (!wedding) {
    console.log('⚠️ Wedding ID 2 not found, skipping guestbook seed');
    return;
  }

  // Get guests for the wedding
  const guests = await prisma.guest.findMany({
    where: { weddingId: wedding.id },
    take: 35,
  });

  const wellWishes = [
    'Wishing you both a lifetime of love and happiness! Congratulations on your beautiful wedding day!',
    'May your marriage be filled with all the right ingredients: a heap of love, a dash of humor, a touch of romance, and a spoonful of understanding. Cheers to the newlyweds!',
    'Your love story is an inspiration to us all. May your journey together be filled with joy, laughter, and endless adventures!',
    'Congratulations on finding your forever person. May your love grow stronger with each passing day!',
    'What a beautiful celebration! Wishing you a marriage filled with love, laughter, and countless cherished memories.',
    'May the years ahead be filled with lasting joy, happiness, and romance. Congratulations on your wedding!',
    'As you start this new chapter together, may your days be filled with love and your nights with sweet dreams. Congratulations!',
    'Your wedding was absolutely magical! Wishing you both all the happiness in the world as you begin this wonderful journey together.',
    "Cheers to love, laughter, and happily ever after! May your marriage be everything you've dreamed of and more.",
    'Congratulations on your special day! May your love continue to grow and flourish throughout the years.',
    'What a perfect match! Wishing you a lifetime of happiness, love, and adventure together.',
    'May your love story continue to be written with joy, compassion, and understanding. Best wishes to the happy couple!',
    "Your love for each other shines so brightly! May it continue to light your way through all of life's adventures.",
    'Wishing you a lifetime of love, laughter, and happiness. Congratulations on your beautiful wedding!',
    'May your marriage be blessed with faith, joy, and love. Congratulations on this special day!',
    "Here's to a lifetime of shared dreams, wonderful memories, and endless love. Congratulations!",
    'Your wedding was the most beautiful celebration of love! Wishing you both a wonderful life together.',
    'May your love continue to bloom and your lives together be filled with endless joy. Congratulations!',
    'Wishing you a marriage filled with romance, laughter, and adventure. Congratulations to both of you!',
    'What a beautiful beginning to your forever! May your marriage be everything you hope for and more.',
    'Congratulations on your wedding day! May your love story be as timeless and beautiful as the love you share.',
    'May the love you share today grow stronger as you grow old together. Best wishes for a wonderful life!',
    'Your love is truly special! Wishing you all the best as you embark on this incredible journey together.',
    'May your marriage be filled with all the right ingredients for a lifetime of happiness. Congratulations!',
    'Wishing you both a lifetime of love, happiness, and everything your hearts desire. Congratulations!',
    'Your wedding was absolutely stunning! May your life together be just as beautiful.',
    'May your love for each other only deepen with time. Wishing you a lifetime of happiness together!',
    'Congratulations on finding your soulmate! May your marriage be blessed with love, laughter, and joy.',
    "Here's to a beautiful future together! May your days be filled with love and your nights with peace.",
    'Your love story is truly inspiring! Wishing you both all the happiness in the world.',
    'May your marriage be a source of joy, strength, and inspiration for years to come. Congratulations!',
    'Wishing you a lifetime of beautiful moments and cherished memories together. Congratulations on your wedding!',
    'Your wedding day was perfect! May your marriage be even more wonderful. Best wishes to you both!',
    'May the love and happiness you feel today shine through the years. Congratulations on your special day!',
    'Wishing you both a beautiful journey as you build your new lives together. Congratulations and best wishes!',
  ];

  // Create guestbook with 35 well wishes
  const guestNotes = guests.slice(0, 35).map((guest, index) => ({
    guestName: guest.name,
    message: wellWishes[index % wellWishes.length],
    timestamp: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(), // Random time in last 30 days
  }));

  await prisma.guestbook.create({
    data: {
      weddingId: wedding.id,
      guestNotes: guestNotes,
    },
  });

  console.log(`✅ Created guestbook with ${guestNotes.length} well wishes`);
  console.log(
    `✅ Well wishes from: ${guestNotes
      .slice(0, 5)
      .map((n) => n.guestName)
      .join(', ')}, and ${guestNotes.length - 5} more...`,
  );
}
