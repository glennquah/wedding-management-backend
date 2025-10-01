import { PrismaClient } from '@prisma/client';

export async function seedListings(prisma: PrismaClient) {
  console.log('✅ Seeding listings...');

  const vendors = await prisma.vendor.findMany({
    include: { user: true },
  });

  const listingsData = [
    // Venue listings
    {
      vendorEmail: 'vendor@wedding.com',
      listings: [
        {
          listingName: 'Grand Ballroom - Premium Package',
          price: 15000,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Includes lighting, sound system, and basic decoration',
        },
        {
          listingName: 'Grand Ballroom - Standard Package',
          price: 12000,
          availabilities: [
            {
              startTime: '2024-10-20T08:00:00Z',
              endTime: '2024-10-20T17:00:00Z',
              date: '2024-10-20',
            },
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
          ],
          remarks: 'Basic venue rental with standard amenities',
        },
      ],
    },
    {
      vendorEmail: 'garden@venue.com',
      listings: [
        {
          listingName: 'Garden Paradise - Outdoor Ceremony',
          price: 8000,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-10-20T08:00:00Z',
              endTime: '2024-10-20T17:00:00Z',
              date: '2024-10-20',
            },
          ],
          remarks: 'Beautiful outdoor setting with garden views',
        },
        {
          listingName: 'Garden Paradise - Reception Hall',
          price: 10000,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Indoor reception space with garden access',
        },
      ],
    },
    {
      vendorEmail: 'heritage@venue.com',
      listings: [
        {
          listingName: 'Heritage Temple - Traditional Ceremony',
          price: 6000,
          availabilities: [
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Authentic traditional setting for cultural ceremonies',
        },
      ],
    },
    // Catering listings
    {
      vendorEmail: 'gourmet@catering.com',
      listings: [
        {
          listingName: 'Gourmet 5-Course Dinner',
          price: 120,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Per person pricing for premium dining experience',
        },
        {
          listingName: 'Gourmet Cocktail Reception',
          price: 80,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-10-20T08:00:00Z',
              endTime: '2024-10-20T17:00:00Z',
              date: '2024-10-20',
            },
          ],
          remarks: 'Per person pricing for cocktail hour with canapés',
        },
      ],
    },
    {
      vendorEmail: 'traditional@catering.com',
      listings: [
        {
          listingName: 'Traditional Chinese Banquet',
          price: 100,
          availabilities: [
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Per person pricing for authentic Chinese cuisine',
        },
      ],
    },
    // Photography listings
    {
      vendorEmail: 'eternal@photo.com',
      listings: [
        {
          listingName: 'Premium Wedding Photography Package',
          price: 3500,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Full day coverage with edited photos and album',
        },
        {
          listingName: 'Engagement Session',
          price: 800,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-10-20T08:00:00Z',
              endTime: '2024-10-20T17:00:00Z',
              date: '2024-10-20',
            },
          ],
          remarks: '2-hour engagement photography session',
        },
      ],
    },
    {
      vendorEmail: 'candid@photo.com',
      listings: [
        {
          listingName: 'Candid Wedding Documentation',
          price: 2800,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-10-20T08:00:00Z',
              endTime: '2024-10-20T17:00:00Z',
              date: '2024-10-20',
            },
          ],
          remarks: 'Natural storytelling photography style',
        },
      ],
    },
    // Decoration listings
    {
      vendorEmail: 'floral@decor.com',
      listings: [
        {
          listingName: 'Luxury Floral Arrangements',
          price: 4500,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2025-01-25T08:00:00Z',
              endTime: '2025-01-25T17:00:00Z',
              date: '2025-01-25',
            },
          ],
          remarks: 'Premium floral decorations for ceremony and reception',
        },
        {
          listingName: 'Bridal Bouquet & Centerpieces',
          price: 1500,
          availabilities: [
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
          ],
          remarks: 'Bridal bouquet with matching table centerpieces',
        },
      ],
    },
  ];

  const createdListings = [];
  for (const vendorListings of listingsData) {
    const vendor = vendors.find(
      (v) => v.user.email === vendorListings.vendorEmail,
    );
    if (vendor) {
      for (const listing of vendorListings.listings) {
        const createdListing = await prisma.listing.create({
          data: {
            listingName: listing.listingName,
            price: listing.price,
            availabilities: listing.availabilities, // Store as JSON array of date strings
            remarks: listing.remarks,
            vendorId: vendor.userId,
          },
        });
        createdListings.push(createdListing);
      }
    }
  }

  console.log(`✅ Created ${createdListings.length} listings`);
}
