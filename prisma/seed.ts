import { PrismaClient } from '@prisma/client';
import { seedAlbums } from './seeds/albums.seed';
import { seedCalendarConnections } from './seeds/calendar-connections.seed';
import { seedCouples } from './seeds/couples.seed';
import { seedEmailHistory } from './seeds/email-history.seed';
import { seedEmailTemplates } from './seeds/email-templates.seed';
import { seedGuests } from './seeds/guests.seed';
import { seedListings } from './seeds/listings.seed';
import { seedMicrosites } from './seeds/microsites.seed';
import { seedOrders } from './seeds/orders.seed';
import { seedUsers } from './seeds/users.seed';
import { seedVendors } from './seeds/vendors.seed';
import { seedWeddings } from './seeds/weddings.seed';

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
    await prisma.microsite.deleteMany();
    await prisma.album.deleteMany();
    await prisma.googleCalendarConnection.deleteMany();
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

  // 2. Seed users (SuperAdmin)
  const hashedPassword = await seedUsers(prisma);

  // 3. Seed weddings
  const weddings = await seedWeddings(prisma);

  // 4. Seed microsites (depends on weddings)
  await seedMicrosites(prisma, weddings);

  // 4.5. Seed albums (depends on weddings)
  await seedAlbums(prisma, weddings);

  // 5. Seed couples (depends on weddings and hashedPassword)
  await seedCouples(prisma, weddings, hashedPassword);

  // 6. Seed vendors (depends on hashedPassword)
  await seedVendors(prisma, hashedPassword);

  // 7. Seed email templates (depends on notification details from weddings and vendors)
  await seedEmailTemplates(prisma);

  // 8. Seed email history (depends on email templates and notification details)
  await seedEmailHistory(prisma);

  // 9. Seed listings (depends on vendors)
  await seedListings(prisma);

  // 10. Seed orders (depends on weddings and listings)
  await seedOrders(prisma);

  // 11. Seed guests (depends on weddings)
  await seedGuests(prisma);

  // 12. Seed Google Calendar connections (depends on weddings, couples, and guests)
  await seedCalendarConnections(prisma);

  // Print final summary
  console.log('\n========================================');
  console.log('✅ Database seeded successfully!');
  console.log('========================================');
  console.log('Summary:');
  console.log('- 1 Super Admin');
  console.log('- 10 Admin users (5 couples)');
  console.log('- 20 Vendor users');
  console.log('- 5 Weddings');
  console.log('- 1 Microsite');
  console.log('- 1 Album');
  console.log('- 25 Notification Details (5 for weddings, 20 for vendors)');
  console.log(
    '- 127 Email Templates (2 SuperAdmin + 125 for notification details)',
  );
  console.log(
    '- 250 Email Notification History entries (10 per wedding + 10 per vendor)',
  );
  console.log('- 40+ listings across all vendors (2-3 per vendor)');
  console.log(
    '- 12-18 orders per wedding (~75 total orders) with dates spread across 12 months',
  );
  console.log(
    '- Order status: 70% paid, 10% completed, 15% pending, 5% cancelled',
  );
  console.log(
    '- ~80 primary guests per wedding (some with accompanying guests)',
  );
  console.log('- ~30% of primary guests have 1-3 accompanying guests each');
  console.log(
    '- Accompanying guests have individual confirmation status and dietary requirements',
  );
  console.log(`\n✨ DATE OPTIMIZER TEST DATA (All Weddings):`);
  console.log(`- All main couples have mock calendar connections`);
  console.log(`- 5 key attendees added per wedding`);
  console.log(`\n📧 Test Login Credentials:`);
  console.log(`  Email: couple@wedding.com`);
  console.log(`  Password: password123`);
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
