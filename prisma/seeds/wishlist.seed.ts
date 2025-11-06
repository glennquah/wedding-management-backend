import { PrismaClient } from '@prisma/client';

export async function seedWishlist(prisma: PrismaClient) {
  console.log('✅ Seeding wishlist items...');

  // Get wedding ID 2 (Glenn & Jes Chan's wedding)
  const wedding = await prisma.wedding.findUnique({
    where: { id: 2 },
  });

  if (!wedding) {
    console.log('⚠️ Wedding ID 2 not found, skipping wishlist seed');
    return;
  }

  // Get all guests for this wedding to use as reservers
  const guests = await prisma.guest.findMany({
    where: { weddingId: wedding.id },
    take: 20,
  });

  const wishlistItems = [
    {
      title: 'KitchenAid Stand Mixer - Red',
      itemUrl: 'https://www.amazon.com/kitchenaid-mixer',
      price: 449.99,
    },
    {
      title: 'Dyson V15 Vacuum Cleaner',
      itemUrl: 'https://www.dyson.com/v15',
      price: 649.99,
    },
    {
      title: 'Nespresso Vertuo Coffee Machine',
      itemUrl: 'https://www.nespresso.com/vertuo',
      price: 199.99,
    },
    {
      title: 'Le Creuset Dutch Oven 5.5Qt',
      itemUrl: 'https://www.lecreuset.com/dutch-oven',
      price: 379.99,
    },
    {
      title: 'All-Clad Stainless Steel Cookware Set',
      itemUrl: 'https://www.all-clad.com/cookware',
      price: 799.99,
    },
    {
      title: 'Vitamix Professional Blender',
      itemUrl: 'https://www.vitamix.com/professional',
      price: 549.99,
    },
    {
      title: 'Breville Smart Oven Air Fryer',
      itemUrl: 'https://www.breville.com/smart-oven',
      price: 399.99,
    },
    {
      title: 'Brooklinen Luxury Sheet Set - King',
      itemUrl: 'https://www.brooklinen.com/sheets',
      price: 149.0,
    },
    {
      title: 'Yeti Roadie 24 Hard Cooler',
      itemUrl: 'https://www.yeti.com/coolers/roadie-24',
      price: 249.99,
    },
    {
      title: 'Sonos One Smart Speaker (Pair)',
      itemUrl: 'https://www.sonos.com/one',
      price: 438.0,
    },
    {
      title: 'iRobot Roomba j7+ Robot Vacuum',
      itemUrl: 'https://www.irobot.com/roomba-j7',
      price: 799.99,
    },
    {
      title: 'Instant Pot Duo Plus 8Qt',
      itemUrl: 'https://www.instantpot.com/duo-plus',
      price: 119.99,
    },
    {
      title: 'Bose QuietComfort Headphones',
      itemUrl: 'https://www.bose.com/quietcomfort',
      price: 349.0,
    },
    {
      title: 'Ninja Foodi 14-in-1 Pressure Cooker',
      itemUrl: 'https://www.ninjakitchen.com/foodi',
      price: 229.99,
    },
    {
      title: 'Shark Navigator Lift-Away Deluxe',
      itemUrl: 'https://www.sharkclean.com/navigator',
      price: 199.99,
    },
    {
      title: 'Cuisinart Food Processor 14-Cup',
      itemUrl: 'https://www.cuisinart.com/food-processor',
      price: 249.99,
    },
    {
      title: 'Lodge Cast Iron Skillet Set',
      itemUrl: 'https://www.lodgecastiron.com/skillet-set',
      price: 89.99,
    },
    {
      title: 'OXO Good Grips Kitchen Utensil Set',
      itemUrl: 'https://www.oxo.com/utensil-set',
      price: 79.99,
    },
    {
      title: 'Wüsthof Classic 8-Piece Knife Block',
      itemUrl: 'https://www.wusthof.com/knife-block',
      price: 499.99,
    },
    {
      title: 'Hydro Flask Water Bottle Set',
      itemUrl: 'https://www.hydroflask.com/bottles',
      price: 109.99,
    },
  ];

  // Create 25 wishlist items with 80% (20 out of 25) reserved
  // Joshua Goh should reserve the most items (8 items)
  let totalValue = 0;
  let reservedValue = 0;
  const itemsToCreate = 25;
  const reservedCount = 20; // 80% of 25

  // Create a special guest name for Joshua Goh
  const joshuaGoh = 'Joshua Goh';
  const joshuaReservedCount = 8; // Joshua reserves 8 items

  for (let i = 0; i < itemsToCreate; i++) {
    const itemTemplate = wishlistItems[i % wishlistItems.length];
    const isReserved = i < reservedCount;

    let reservedByName = null;
    if (isReserved) {
      // First 8 reserved items go to Joshua Goh
      if (i < joshuaReservedCount) {
        reservedByName = joshuaGoh;
      } else {
        // Remaining reserved items distributed among other guests
        // This ensures no one else gets more than 2-3 items
        reservedByName =
          guests[(i - joshuaReservedCount) % guests.length]?.name;
      }
    }

    // Add some variation to prices
    const priceVariation = Math.random() * 100 - 50; // -$50 to +$50
    const finalPrice = itemTemplate.price + priceVariation;

    await prisma.wishlistItem.create({
      data: {
        title:
          i >= wishlistItems.length
            ? `${itemTemplate.title} (${i})`
            : itemTemplate.title,
        itemUrl: itemTemplate.itemUrl,
        isReserved: isReserved,
        reservedByName: reservedByName,
        weddingId: wedding.id,
      },
    });

    totalValue += finalPrice;
    if (isReserved) {
      reservedValue += finalPrice;
    }
  }

  console.log(`✅ Created ${itemsToCreate} wishlist items`);
  console.log(`✅ ${reservedCount} items reserved (80% completion)`);
  console.log(
    `✅ Joshua Goh reserved the most items: ${joshuaReservedCount} items`,
  );
  console.log(`✅ Estimated total wishlist value: $${totalValue.toFixed(2)}`);
  console.log(`✅ Estimated reserved value: $${reservedValue.toFixed(2)}`);
}
