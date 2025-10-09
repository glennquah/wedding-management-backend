import { PrismaClient } from '@prisma/client';
import { seedRecommendationCouples } from './seeds/couples.recommendation.seed';
import { seedRecommendationListings } from './seeds/listings.recommendation.seed';
import { seedRecommendationOrders } from './seeds/orders.recommendation.seed';
import { seedUsers } from './seeds/users.seed';
import { seedRecommendationVendors } from './seeds/vendors.recommendation.seed';
import { seedRecommendationWeddings } from './seeds/weddings.recommendation.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Seeding database...');

  console.log('✅ Clearing existing data...');
  try {
    await prisma.emailNotificationHistory.deleteMany();
    await prisma.emailTemplate.deleteMany();
    await prisma.notificationDetails.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.wedding.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.superAdmin.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared');
  } catch (error: unknown) {
    console.log('Error in seeding: ', error);
  }

  // Step 1: Create SuperAdmin user
  const hashedPassword = await seedUsers(prisma);

  // Step 2: Create weddings (must be before couples, as couples reference weddings)
  const weddings = await seedRecommendationWeddings(prisma);

  // Step 3: Create couples and link to weddings
  await seedRecommendationCouples(prisma, weddings, hashedPassword);

  // Step 4: Create vendors
  await seedRecommendationVendors(prisma, hashedPassword);

  // Step 5: Create listings (depends on vendors)
  await seedRecommendationListings(prisma);

  // Step 6: Create orders with intelligent booking rules (depends on weddings and listings)
  await seedRecommendationOrders(prisma);

  // Print final summary
  console.log('\n========================================');
  console.log('✅ Database seeded successfully!');
  console.log('========================================');
  console.log('Summary:');
  const userCount = await prisma.user.count();
  const adminCount = await prisma.admin.count();
  const vendorCount = await prisma.vendor.count();
  const weddingCount = await prisma.wedding.count();
  const listingCount = await prisma.listing.count();
  const orderCount = await prisma.order.count();
  const orderListingCount = await prisma.orderListing.count();

  console.log(`- Total Users: ${userCount}`);
  console.log(`- Total Admins: ${adminCount}`);
  console.log(`- Total Vendors: ${vendorCount}`);
  console.log(`- Total Weddings: ${weddingCount}`);
  console.log(`- Total Listings: ${listingCount}`);
  console.log(`- Total Orders: ${orderCount}`);
  console.log(`- Total Order-Listing Relationships: ${orderListingCount}`);
  console.log('========================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
