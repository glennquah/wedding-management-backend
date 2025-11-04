import { PrismaClient } from '@prisma/client';

export async function seedListings(prisma: PrismaClient) {
  console.log('✅ Seeding listings...');

  const vendors = await prisma.vendor.findMany({
    include: { user: true },
  });

  const listingsData = [
    // Venue listings - vendor@wedding.com with balanced pricing (2 listings)
    {
      vendorEmail: 'vendor@wedding.com',
      listings: [
        {
          listingName: 'Grand Ballroom Package',
          price: 8500,
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
            {
              startTime: '2025-02-14T08:00:00Z',
              endTime: '2025-02-14T17:00:00Z',
              date: '2025-02-14',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302508/ballroom_1_vrgb7s.jpg',
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302892/flowers_i5p5iq.jpg',
          ],
          remarks:
            'Elegant ballroom with premium lighting, sound system, and decoration',
        },
        {
          listingName: 'Waterfront Terrace Wedding',
          price: 7500,
          availabilities: [
            {
              startTime: '2024-11-15T08:00:00Z',
              endTime: '2024-11-15T17:00:00Z',
              date: '2024-11-15',
            },
            {
              startTime: '2025-01-10T08:00:00Z',
              endTime: '2025-01-10T17:00:00Z',
              date: '2025-01-10',
            },
            {
              startTime: '2025-06-25T08:00:00Z',
              endTime: '2025-06-25T17:00:00Z',
              date: '2025-06-25',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302561/garden_qtylu6.jpg',
          ],
          remarks: 'Stunning waterfront views with outdoor ceremony space',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302561/garden_qtylu6.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303198/wedding_resort_ki7c5g.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303164/temple_k1qe4z.jpg',
          ],
          remarks: 'Authentic traditional setting for cultural ceremonies',
        },
        {
          listingName: 'Heritage Hall - Reception Package',
          price: 7200,
          availabilities: [
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
            {
              startTime: '2025-02-20T08:00:00Z',
              endTime: '2025-02-20T17:00:00Z',
              date: '2025-02-20',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303164/temple_k1qe4z.jpg',
          ],
          remarks: 'Traditional banquet hall for receptions',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302702/gourmet_pqadyf.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302675/cocktail_ccnx9r.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302684/chinese_lxil0v.jpg',
          ],
          remarks: 'Per person pricing for authentic Chinese cuisine',
        },
        {
          listingName: 'Traditional Tea Ceremony Package',
          price: 85,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302684/chinese_lxil0v.jpg',
          ],
          remarks: 'Per person pricing for traditional tea ceremony',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302816/photog_i3tqtz.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302824/wedding_photog_cc3dff.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303156/candid_geijp4.jpg',
          ],
          remarks: 'Natural storytelling photography style',
        },
        {
          listingName: 'Pre-Wedding Shoot',
          price: 1200,
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303156/candid_geijp4.jpg',
          ],
          remarks: 'Outdoor pre-wedding photography session',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302892/flowers_i5p5iq.jpg',
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302888/premium_flowers_ys61y0.jpg',
          ],
          remarks: 'Bridal bouquet with matching table centerpieces',
        },
      ],
    },
    {
      vendorEmail: 'rustic@decor.com',
      listings: [
        {
          listingName: 'Rustic Wood & Greenery Setup',
          price: 3200,
          availabilities: [
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302561/garden_qtylu6.jpg',
          ],
          remarks: 'Natural wooden elements with foliage decorations',
        },
        {
          listingName: 'Vintage Furniture Rental',
          price: 1800,
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759302561/garden_qtylu6.jpg',
          ],
          remarks: 'Assorted vintage furniture pieces for rustic ambiance',
        },
      ],
    },
    {
      vendorEmail: 'cultural@decor.com',
      listings: [
        {
          listingName: 'Traditional Chinese Wedding Decor',
          price: 3800,
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303164/temple_k1qe4z.jpg',
          ],
          remarks: 'Authentic cultural decorations with traditional elements',
        },
        {
          listingName: 'Red & Gold Ceremony Setup',
          price: 2200,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1759303164/temple_k1qe4z.jpg',
          ],
          remarks: 'Traditional color scheme with cultural motifs',
        },
      ],
    },
    // Music listings
    {
      vendorEmail: 'symphony@music.com',
      listings: [
        {
          listingName: 'Full Orchestra Performance',
          price: 5500,
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
          imageUrls: [],
          remarks: 'Professional orchestra for ceremony and reception',
        },
        {
          listingName: 'String Quartet',
          price: 2200,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
          ],
          imageUrls: [],
          remarks: 'Elegant string quartet for intimate ceremonies',
        },
      ],
    },
    {
      vendorEmail: 'cultural@music.com',
      listings: [
        {
          listingName: 'Traditional Music Ensemble',
          price: 2800,
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
          imageUrls: [],
          remarks: 'Traditional instruments for cultural ceremonies',
        },
        {
          listingName: 'Chinese Instrumental Trio',
          price: 1800,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [],
          remarks: 'Trio performance with traditional Chinese instruments',
        },
      ],
    },
    // Attire listings
    {
      vendorEmail: 'couture@attire.com',
      listings: [
        {
          listingName: 'Custom Designer Gown',
          price: 6500,
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
          imageUrls: [],
          remarks: 'Bespoke wedding gown with full fitting service',
        },
        {
          listingName: 'Premium Gown Rental',
          price: 2500,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
          ],
          imageUrls: [],
          remarks: 'Designer gown rental with alterations',
        },
      ],
    },
    {
      vendorEmail: 'traditional@attire.com',
      listings: [
        {
          listingName: 'Traditional Qipao/Cheongsam',
          price: 3200,
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
          imageUrls: [],
          remarks: 'Authentic traditional Chinese wedding attire',
        },
        {
          listingName: 'Cultural Wedding Set',
          price: 2800,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [],
          remarks: 'Complete traditional outfit for bride and groom',
        },
      ],
    },
    // Makeup listings
    {
      vendorEmail: 'glamour@makeup.com',
      listings: [
        {
          listingName: 'Bridal Makeup & Hair Full Package',
          price: 1500,
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
          imageUrls: [],
          remarks: 'Complete bridal makeup and hairstyling',
        },
        {
          listingName: 'Bridal Party Makeup',
          price: 600,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
          ],
          imageUrls: [],
          remarks: 'Makeup service for bridesmaids (price per person)',
        },
      ],
    },
    {
      vendorEmail: 'elegant@makeup.com',
      listings: [
        {
          listingName: 'Modern Bridal Styling',
          price: 1200,
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
          imageUrls: [],
          remarks: 'Contemporary bridal makeup and hair',
        },
        {
          listingName: 'Touch-up Service',
          price: 400,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-12-15T08:00:00Z',
              endTime: '2024-12-15T17:00:00Z',
              date: '2024-12-15',
            },
          ],
          imageUrls: [],
          remarks: 'On-site touch-up service throughout the day',
        },
      ],
    },
    // Transportation listings
    {
      vendorEmail: 'luxury@transport.com',
      listings: [
        {
          listingName: 'Luxury Limousine Package',
          price: 2500,
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
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1762247043/limo_i5vnro.jpg',
          ],
          remarks: 'Premium limousine for bridal transport',
        },
        {
          listingName: 'Vintage Car Rental',
          price: 1800,
          availabilities: [
            {
              startTime: '2024-09-30T08:00:00Z',
              endTime: '2024-09-30T17:00:00Z',
              date: '2024-09-30',
            },
            {
              startTime: '2024-11-08T08:00:00Z',
              endTime: '2024-11-08T17:00:00Z',
              date: '2024-11-08',
            },
          ],
          imageUrls: [
            'https://res.cloudinary.com/dnyxxyolp/image/upload/v1762247043/vintage-car_rxcm0x.webp',
          ],
          remarks: 'Classic vintage car for memorable photos',
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
            imageUrls: listing.imageUrls,
          },
        });
        createdListings.push(createdListing);
      }
    }
  }

  console.log(`✅ Created ${createdListings.length} listings`);
}
