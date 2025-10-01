import {
  BudgetBucket,
  ConfirmationStatus,
  EmailTemplateType,
  GuestCountBucket,
  PrismaClient,
  UserRole,
  VendorOnboardingStatus,
  WeddingService,
  WeddingStyle,
  WeddingType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Seeding database...');

  // Clear existing data first (if tables exist)
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('✅ Database is fresh, no data to clear');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@wedding.com',
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      superAdmin: {
        create: {},
      },
    },
  });

  // Create SuperAdmin notification details
  const superAdminNotificationDetails = await prisma.notificationDetails.create(
    {
      data: {
        isSuperAdminNotification: true,
      },
    },
  );

  // Create SuperAdmin email templates
  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'Platform Update Announcement',
        subject: '🎉 Exciting New Features on Knotly Wedding Platform!',
        htmlContent: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Platform Update - Knotly</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }

      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .header {
        background: linear-gradient(135deg, #ff5a5f 0%, #45292f 100%);
        padding: 40px 20px;
        text-align: center;
      }

      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #ffffff !important;
        text-decoration: none;
        letter-spacing: 1px;
        display: block;
        text-align: center;
        margin: 0 auto;
      }

      .logo-img {
        width: 150px;
        height: 50px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }

      .tagline {
        color: #ffffff;
        font-size: 14px;
        margin-top: 8px;
        opacity: 0.9;
      }

      .content {
        padding: 40px 30px;
      }

      .greeting {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 20px;
      }

      .message {
        font-size: 16px;
        line-height: 1.7;
        color: #555;
        margin-bottom: 30px;
      }

      .feature-card {
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 8px;
        border-left: 4px solid #ff5a5f;
        background-color: #fff5f5;
      }

      .feature-title {
        font-size: 18px;
        font-weight: 600;
        color: #ff5a5f;
        margin-bottom: 8px;
      }

      .feature-description {
        font-size: 14px;
        color: #555;
        line-height: 1.5;
      }

      .cta-container {
        text-align: center;
        margin: 40px 0;
      }

      .cta-button {
        display: inline-block;
        background: linear-gradient(
          135deg,
          #ff5a5f 0%,
          #da3c41 100%
        ) !important;
        color: #ffffff !important;
        text-decoration: none !important;
        padding: 16px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: transform 0.2s ease;
        box-shadow: 0 4px 15px rgba(255, 90, 95, 0.3);
        border: none !important;
      }

      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 90, 95, 0.4);
      }

      .divider {
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          #e0e0e0,
          transparent
        );
        margin: 30px 0;
      }

      .footer {
        background-color: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }

      .footer-logo {
        font-size: 18px;
        font-weight: bold;
        color: #ff5a5f;
        margin-bottom: 10px;
      }

      .footer-text {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 15px;
      }

      .social-links {
        margin: 20px 0;
      }

      .social-link {
        display: inline-block;
        margin: 0 10px;
        color: #ff5a5f;
        text-decoration: none;
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .email-container {
          margin: 0;
          border-radius: 0;
        }

        .content {
          padding: 30px 20px;
        }

        .header {
          padding: 30px 20px;
        }

        .greeting {
          font-size: 20px;
        }

        .cta-button {
          padding: 14px 28px;
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div style="text-align: center">
          <img
            src="https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png"
            alt="Knotly Logo"
            class="logo-img"
          />
        </div>
        <div class="tagline">Exciting New Features & Updates!</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hello Knotly Community! ✨</div>

        <div class="message">
          We're thrilled to announce exciting new updates to the Knotly Wedding Platform! We've been working hard to bring you features that make wedding planning even easier and more delightful.
        </div>

        <!-- Feature Cards -->
        <div class="feature-card">
          <div class="feature-title">🎨 Enhanced Vendor Portfolios</div>
          <div class="feature-description">
            Vendors can now showcase their work with beautiful galleries and detailed service descriptions.
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-title">📅 Smart Booking System</div>
          <div class="feature-description">
            Real-time availability checks and instant booking confirmations make planning a breeze.
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-title">💌 Improved Guest Management</div>
          <div class="feature-description">
            Track RSVPs, dietary preferences, and seating arrangements all in one place.
          </div>
        </div>

        <div class="cta-container">
          <a href="https://knotly.app" class="cta-button">Explore New Features</a>
        </div>

        <div class="divider"></div>

        <div class="message">
          These features are available now! Log in to your account to explore everything we've built for you. As always, we're here to help make your wedding planning journey unforgettable. If you have questions or feedback, don't hesitate to reach out!
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <a href="https://knotly.app" class="logo">
          <img
            src="https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png"
            alt="Knotly Logo"
            class="logo-img"
          />
        </a>
        <div class="footer-text">
          Making your dream wedding a reality, one detail at a time.
        </div>

        <div class="social-links">
          <a href="https://knotly.app" class="social-link">Website</a>
          <a href="https://knotly.app/support" class="social-link">Support</a>
          <a href="mailto:hello@knotly.app" class="social-link">Contact</a>
        </div>
      </div>
    </div>
  </body>
</html>
        `,
        textContent:
          "Exciting New Features on Knotly Wedding Platform! Dear Knotly Community, we're thrilled to announce exciting new updates: Enhanced Vendor Portfolios, Smart Booking System, and Improved Guest Management. Log in now to explore! - The Knotly Team",
        notificationDetailsId: superAdminNotificationDetails.id,
      },
      {
        name: 'Vendor Price Increase Notice',
        subject: '📢 Important Update: Service Fee Adjustment for Vendors',
        htmlContent: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Service Fee Update - Knotly</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }

      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .header {
        background: linear-gradient(135deg, #ff5a5f 0%, #45292f 100%);
        padding: 40px 20px;
        text-align: center;
      }

      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #ffffff !important;
        text-decoration: none;
        letter-spacing: 1px;
        display: block;
        text-align: center;
        margin: 0 auto;
      }

      .logo-img {
        width: 150px;
        height: 50px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }

      .tagline {
        color: #ffffff;
        font-size: 14px;
        margin-top: 8px;
        opacity: 0.9;
      }

      .content {
        padding: 40px 30px;
      }

      .greeting {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 20px;
      }

      .message {
        font-size: 16px;
        line-height: 1.7;
        color: #555;
        margin-bottom: 30px;
      }

      .notice-box {
        padding: 25px;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
        border-radius: 12px;
        border-left: 5px solid #ff5a5f;
        margin: 30px 0;
      }

      .notice-title {
        font-size: 20px;
        font-weight: 600;
        color: #ff5a5f;
        margin-bottom: 15px;
      }

      .rate-row {
        padding: 12px 0;
        border-bottom: 1px solid #ffcccc;
      }

      .rate-label {
        color: #666666;
        font-size: 14px;
      }

      .rate-value {
        font-size: 18px;
        font-weight: 600;
        color: #333333;
        margin-top: 5px;
      }

      .rate-value-new {
        font-size: 20px;
        font-weight: 700;
        color: #ff5a5f;
        margin-top: 5px;
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: #333333;
        margin: 30px 0 15px;
      }

      .benefit-item {
        padding: 15px 0;
        display: table;
        width: 100%;
      }

      .benefit-icon {
        display: table-cell;
        width: 30px;
        vertical-align: top;
        font-size: 20px;
      }

      .benefit-content {
        display: table-cell;
        padding-left: 10px;
        vertical-align: top;
      }

      .benefit-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 5px;
      }

      .benefit-description {
        font-size: 14px;
        color: #666666;
        line-height: 1.5;
      }

      .highlight-box {
        padding: 25px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 12px;
        border-left: 5px solid #0ea5e9;
        margin: 30px 0;
      }

      .highlight-title {
        font-size: 18px;
        font-weight: 600;
        color: #0ea5e9;
        margin-bottom: 15px;
      }

      .contact-box {
        padding: 20px;
        background-color: #fffbeb;
        border-radius: 8px;
        border: 1px solid #fde68a;
        margin: 30px 0;
      }

      .contact-title {
        color: #92400e;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .contact-text {
        color: #78350f;
        font-size: 14px;
        line-height: 1.5;
      }

      .cta-container {
        text-align: center;
        margin: 40px 0;
      }

      .cta-button {
        display: inline-block;
        background: linear-gradient(
          135deg,
          #ff5a5f 0%,
          #da3c41 100%
        ) !important;
        color: #ffffff !important;
        text-decoration: none !important;
        padding: 16px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: transform 0.2s ease;
        box-shadow: 0 4px 15px rgba(255, 90, 95, 0.3);
        border: none !important;
      }

      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 90, 95, 0.4);
      }

      .divider {
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          #e0e0e0,
          transparent
        );
        margin: 30px 0;
      }

      .footer {
        background-color: #f8f9fa;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }

      .footer-logo {
        font-size: 18px;
        font-weight: bold;
        color: #ff5a5f;
        margin-bottom: 10px;
      }

      .footer-text {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 15px;
      }

      .social-links {
        margin: 20px 0;
      }

      .social-link {
        display: inline-block;
        margin: 0 10px;
        color: #ff5a5f;
        text-decoration: none;
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .email-container {
          margin: 0;
          border-radius: 0;
        }

        .content {
          padding: 30px 20px;
        }

        .header {
          padding: 30px 20px;
        }

        .greeting {
          font-size: 20px;
        }

        .cta-button {
          padding: 14px 28px;
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div style="text-align: center">
          <img
            src="https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png"
            alt="Knotly Logo"
            class="logo-img"
          />
        </div>
        <div class="tagline">Important Service Fee Update</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hello Valued Vendor Partner! 📢</div>

        <div class="message">
          We hope this message finds you well. We're writing to inform you of an upcoming adjustment to our platform service fees, effective <strong>March 1st, 2025</strong>.
        </div>

        <!-- Notice Box -->
        <div class="notice-box">
          <div class="notice-title">What's Changing?</div>
          <div class="rate-row">
            <div class="rate-label">Current Commission Rate</div>
            <div class="rate-value">8.5%</div>
          </div>
          <div class="rate-row" style="border-bottom: none; padding-top: 12px;">
            <div class="rate-label">New Commission Rate</div>
            <div class="rate-value-new">10%</div>
          </div>
        </div>

        <div class="section-title">Why This Change?</div>

        <div class="benefit-item">
          <div class="benefit-icon">💎</div>
          <div class="benefit-content">
            <div class="benefit-title">Enhanced Marketing</div>
            <div class="benefit-description">
              Increased budget for promoting our vendors to more couples.
            </div>
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">🛠️</div>
          <div class="benefit-content">
            <div class="benefit-title">Platform Improvements</div>
            <div class="benefit-description">
              Investment in new features, better user experience, and technical infrastructure.
            </div>
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">🎯</div>
          <div class="benefit-content">
            <div class="benefit-title">Better Support</div>
            <div class="benefit-description">
              Dedicated account managers and priority customer support for our vendors.
            </div>
          </div>
        </div>

        <!-- Highlight Box -->
        <div class="highlight-box">
          <div class="highlight-title">🎁 What You're Getting in Return</div>
          <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
            <li>Priority listing in search results</li>
            <li>Featured vendor spotlight opportunities</li>
            <li>Advanced analytics dashboard</li>
            <li>Professional photography support program</li>
            <li>Exclusive networking events</li>
          </ul>
        </div>

        <div class="message">
          We understand that any price change requires consideration. This adjustment allows us to continue delivering the quality service you deserve while expanding our reach to bring you more business opportunities.
        </div>

        <div class="cta-container">
          <a href="https://knotly.app" class="cta-button">View Full Details</a>
        </div>

        <!-- Contact Box -->
        <div class="contact-box">
          <div class="contact-title">💬 Questions or Concerns?</div>
          <div class="contact-text">
            Our vendor success team is here to help! Reach out at <a href="mailto:vendors@knotly.com" style="color: #ff5a5f; text-decoration: none; font-weight: 600;">vendors@knotly.com</a> or call us at <strong>1-800-KNOTLY</strong>.
          </div>
        </div>

        <div class="divider"></div>

        <div class="message">
          Thank you for being an essential part of the Knotly community. We're committed to your success and look forward to growing together.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <a href="https://knotly.app" class="logo">
          <img
            src="https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png"
            alt="Knotly Logo"
            class="logo-img"
          />
        </a>
        <div class="footer-text">
          Making your dream wedding a reality, one detail at a time.
        </div>

        <div class="social-links">
          <a href="https://knotly.app" class="social-link">Website</a>
          <a href="https://knotly.app/support" class="social-link">Support</a>
          <a href="mailto:hello@knotly.app" class="social-link">Contact</a>
        </div>
      </div>
    </div>
  </body>
</html>
        `,
        textContent:
          "Important Update: Service Fee Adjustment. Dear Vendor Partner, effective March 1st, 2025, our platform commission will adjust from 8.5% to 10%. This enables enhanced marketing, platform improvements, and better support. You'll receive priority listing, featured opportunities, advanced analytics, and more. Questions? Contact vendors@knotly.com or 1-800-KNOTLY. - The Knotly Team",
        notificationDetailsId: superAdminNotificationDetails.id,
      },
    ],
  });

  console.log('✅ Created SuperAdmin notification details and email templates');

  // First, create all weddings without couples
  const weddingThemes = [
    {
      name: "Ryan & Ranae's Enchanted Garden Wedding",
      date: new Date('2024-12-15T14:00:00.000Z'),
      location: 'Marina Bay Grand Ballroom',
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.LUXURY,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.LUXURY,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
        WeddingService.DECORATION,
      ],
    },
    {
      name: "Marcus & Sarah's Traditional Chinese Tea Ceremony",
      date: new Date('2024-11-08T10:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.CHINESE,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
    },
    {
      name: "Amir & Siti's Malay Cultural Celebration",
      date: new Date('2024-10-20T16:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.MALAY,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
    },
    {
      name: "Raj & Priya's Grand Indian Wedding",
      date: new Date('2025-01-25T12:00:00.000Z'),
      location: 'Heritage Temple Hall',
      weddingType: WeddingType.INDIAN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.TRADITIONAL,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
    },
    {
      name: "David & Emma's Modern Beach Wedding",
      date: new Date('2024-09-30T17:00:00.000Z'),
      location: 'Garden Paradise Resort',
      weddingType: WeddingType.WESTERN,
      budgetBucket: BudgetBucket.MEDIUM,
      guestCountBucket: GuestCountBucket.LARGE,
      preferredStyle: WeddingStyle.MODERN,
      preferredServices: [
        WeddingService.VENUE,
        WeddingService.PHOTOGRAPHY,
        WeddingService.CATERING,
      ],
    },
  ];

  const weddings = [];
  for (const theme of weddingThemes) {
    const wedding = await prisma.wedding.create({
      data: {
        name: theme.name,
        date: theme.date,
        location: theme.location,
        weddingType: theme.weddingType,
        budgetBucket: theme.budgetBucket,
        guestCountBucket: theme.guestCountBucket,
        preferredStyle: theme.preferredStyle,
        preferredServices: theme.preferredServices,
        notificationDetails: {
          create: {},
        },
      },
    });
    weddings.push(wedding);
  }

  console.log('✅ Created 5 weddings');

  // Now create the couple users and associate them with weddings
  const couples = [
    {
      name1: 'Ryan Chen',
      email1: 'couple@wedding.com',
      name2: 'Ranae Lim',
      email2: 'ranae.lim@email.com',
      weddingIndex: 0,
    },
    {
      name1: 'Glenn Quah',
      email1: 'quah.glenn@gmail.com',
      name2: 'Sarah Wong',
      email2: 'sarah.wong@email.com',
      weddingIndex: 1,
    },
    {
      name1: 'Amir Rahman',
      email1: 'amir.rahman@email.com',
      name2: 'Siti Abdullah',
      email2: 'siti.abdullah@email.com',
      weddingIndex: 2,
    },
    {
      name1: 'Raj Kumar',
      email1: 'raj.kumar@email.com',
      name2: 'Priya Sharma',
      email2: 'priya.sharma@email.com',
      weddingIndex: 3,
    },
    {
      name1: 'David Lee',
      email1: 'david.lee@email.com',
      name2: 'Emma Johnson',
      email2: 'emma.johnson@email.com',
      weddingIndex: 4,
      isSuspended: true,
    },
  ];

  const coupleUsers = [];
  for (const couple of couples) {
    const wedding = weddings[couple.weddingIndex];
    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          name: couple.name1,
          email: couple.email1,
          password: hashedPassword,
          role: UserRole.ADMIN,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          name: couple.name2,
          email: couple.email2,
          password: hashedPassword,
          role: UserRole.ADMIN,
          admin: {
            create: {
              isSuspended: couple.isSuspended || false,
              mainWeddingId: wedding.id,
            },
          },
        },
      }),
    ]);

    // Connect both admins to the wedding as admins and as main couple
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        admins: {
          connect: [{ userId: user1.id }, { userId: user2.id }],
        },
        mainCouple: {
          connect: [{ userId: user1.id }, { userId: user2.id }],
        },
      },
    });

    coupleUsers.push([user1, user2]);
  }

  console.log('✅ Created couples and associated with weddings');

  const vendorData = [
    {
      name: 'Marina Bay Grand Ballroom',
      email: 'vendor@wedding.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.LUXURY,
      capacity: 300,
      bio: 'Luxurious waterfront venue',
      rating: 4.8,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Garden Paradise Resort',
      email: 'garden@venue.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.RUSTIC,
      capacity: 200,
      bio: 'Beautiful outdoor venue',
      rating: 4.6,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Heritage Temple Hall',
      email: 'heritage@venue.com',
      service: WeddingService.VENUE,
      style: WeddingStyle.TRADITIONAL,
      capacity: 250,
      bio: 'Traditional cultural venue',
      rating: 4.7,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Gourmet Delights Catering',
      email: 'gourmet@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Fine dining catering',
      rating: 4.9,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Traditional Feast Co.',
      email: 'traditional@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Authentic cuisine',
      rating: 4.5,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
    },
    {
      name: 'Modern Bistro Catering',
      email: 'modern@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Contemporary fusion',
      rating: 4.7,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Spice Route Catering',
      email: 'spice@catering.com',
      service: WeddingService.CATERING,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Asian spices specialist',
      rating: 4.6,
      types: [WeddingType.INDIAN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Eternal Moments Photography',
      email: 'eternal@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Award-winning photographers',
      rating: 4.9,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Candid Stories Studio',
      email: 'candid@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Creative storytelling',
      rating: 4.8,
      types: [WeddingType.WESTERN],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Heritage Lens Photography',
      email: 'heritage@photo.com',
      service: WeddingService.PHOTOGRAPHY,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional photography',
      rating: 4.7,
      types: [WeddingType.CHINESE],
      onboardingStatus: VendorOnboardingStatus.ONBOARDED,
      isSuspended: true,
    },
    {
      name: 'Floral Elegance Designs',
      email: 'floral@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Luxury floral arrangements',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Rustic Charm Decorators',
      email: 'rustic@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.RUSTIC,
      capacity: 0,
      bio: 'Natural decorations',
      rating: 4.6,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Cultural Decor Masters',
      email: 'cultural@decor.com',
      service: WeddingService.DECORATION,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional cultural decor',
      rating: 4.7,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Symphony Wedding Orchestra',
      email: 'symphony@music.com',
      service: WeddingService.MUSIC,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Professional orchestra',
      rating: 4.9,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Cultural Music Ensemble',
      email: 'cultural@music.com',
      service: WeddingService.MUSIC,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional music',
      rating: 4.6,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Bridal Couture House',
      email: 'couture@attire.com',
      service: WeddingService.ATTIRE,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Custom luxury gowns',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Traditional Attire Boutique',
      email: 'traditional@attire.com',
      service: WeddingService.ATTIRE,
      style: WeddingStyle.TRADITIONAL,
      capacity: 0,
      bio: 'Traditional wedding attire',
      rating: 4.7,
      types: [WeddingType.CHINESE],
    },
    {
      name: 'Glamour Beauty Studio',
      email: 'glamour@makeup.com',
      service: WeddingService.MAKEUP,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Professional bridal makeup',
      rating: 4.9,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Elegant Touch Makeup',
      email: 'elegant@makeup.com',
      service: WeddingService.MAKEUP,
      style: WeddingStyle.MODERN,
      capacity: 0,
      bio: 'Modern bridal makeup',
      rating: 4.7,
      types: [WeddingType.WESTERN],
    },
    {
      name: 'Luxury Wedding Transport',
      email: 'luxury@transport.com',
      service: WeddingService.TRANSPORTATION,
      style: WeddingStyle.LUXURY,
      capacity: 0,
      bio: 'Premium transportation',
      rating: 4.8,
      types: [WeddingType.WESTERN],
    },
  ];

  for (const vendor of vendorData) {
    await prisma.user.create({
      data: {
        name: vendor.name,
        email: vendor.email,
        password: hashedPassword,
        role: UserRole.VENDOR,
        vendor: {
          create: {
            vendorWebsite: `https://${vendor.name.toLowerCase().replace(/\s+/g, '-')}.com`,
            uenNumber: `UEN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            bio: vendor.bio,
            rating: vendor.rating,
            serviceOffered: vendor.service,
            styleOffered: vendor.style,
            weddingTypes: vendor.types,
            capacity: vendor.capacity,
            onboardingStatus: vendor.onboardingStatus,
            isSuspended: vendor.isSuspended,
            notificationDetails: {
              create: {},
            },
          },
        },
      },
    });
  }

  console.log('✅ Created 20 vendors');

  // Create email templates and notification history for weddings and vendors
  console.log('✅ Creating email templates and notification history...');

  // Get only notification details that belong to weddings or vendors
  const allNotificationDetails = await prisma.notificationDetails.findMany({
    where: {
      OR: [{ weddingId: { not: null } }, { vendorId: { not: null } }],
    },
  });

  // Email template data
  const emailTemplates = [
    {
      name: 'Welcome Template',
      subject: 'Welcome to our Wedding Management Platform!',
      htmlContent: `
        <html>
          <body>
            <h1>Welcome!</h1>
            <p>We're excited to have you join our wedding management platform.</p>
            <p>Start planning your perfect day with us!</p>
            <br>
            <p>Best regards,<br>Wedding Management Team</p>
          </body>
        </html>
      `,
      textContent:
        "Welcome! We're excited to have you join our wedding management platform. Start planning your perfect day with us! Best regards, Wedding Management Team",
    },
    {
      name: 'Password Reset Template',
      subject: 'Reset Your Password',
      htmlContent: `
        <html>
          <body>
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="#reset-link">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Wedding Management Team</p>
          </body>
        </html>
      `,
      textContent:
        "You have requested to reset your password. Click the link to reset your password. If you didn't request this, please ignore this email. Best regards, Wedding Management Team",
    },
    {
      name: 'Successful Booking Template',
      subject: 'Booking Confirmation - {{vendorName}}',
      htmlContent: `
        <html>
          <body>
            <h1>Booking Confirmed!</h1>
            <p>Great news! Your booking has been successfully confirmed.</p>
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Vendor:</strong> {{vendorName}}</li>
              <li><strong>Service:</strong> {{serviceType}}</li>
              <li><strong>Date:</strong> {{bookingDate}}</li>
              <li><strong>Booking ID:</strong> {{bookingId}}</li>
            </ul>
            <p>The vendor will contact you shortly to finalize the details.</p>
            <br>
            <p>Best regards,<br>Wedding Management Team</p>
          </body>
        </html>
      `,
      textContent:
        'Booking Confirmed! Your booking with {{vendorName}} for {{serviceType}} on {{bookingDate}} has been successfully confirmed. Booking ID: {{bookingId}}. Amount: ${{amount}}. The vendor will contact you shortly. Best regards, Wedding Management Team',
    },
    {
      name: 'Vendor Status Update Template',
      subject: 'Vendor Account Status Update',
      htmlContent: `
        <html>
          <body>
            <h1>Vendor Account Status Update</h1>
            <p>Your vendor account status has been updated.</p>
            <h3>Status Details:</h3>
            <p><strong>New Status:</strong> {{vendorStatus}}</p>
            {{#if isPending}}
            <p>Your application is currently under review. We will notify you once the review is complete.</p>
            {{/if}}
            {{#if isOnboarded}}
            <p>Congratulations! Your vendor account has been approved. You can now start receiving bookings and managing your services.</p>
            {{/if}}
            {{#if isRejected}}
            <p>Unfortunately, your vendor application has been rejected. Please contact our support team for more information.</p>
            {{/if}}
            <br>
            <p>Best regards,<br>Wedding Management Team</p>
          </body>
        </html>
      `,
      textContent:
        'Vendor Account Status Update: Your vendor account status has been updated to {{vendorStatus}}. {{#if isPending}}Your application is under review.{{/if}}{{#if isOnboarded}}Congratulations! Your account has been approved.{{/if}}{{#if isRejected}}Your application has been rejected. Contact support for details.{{/if}} Best regards, Wedding Management Team',
    },
    {
      name: 'Admin Status Update Template',
      subject: 'Account Status Notification',
      htmlContent: `
        <html>
          <body>
            <h1>Account Status Update</h1>
            <p>Your account status has been updated by our administrative team.</p>
            <h3>Status Details:</h3>
            {{#if isSuspended}}
            <p><strong>Status:</strong> Account Suspended</p>
            <p>Your account has been temporarily suspended. This means you will have limited access to platform features.</p>
            <p>If you believe this is an error, please contact our support team immediately.</p>
            {{else}}
            <p><strong>Status:</strong> Account Active</p>
            <p>Good news! Your account suspension has been lifted and your account is now active.</p>
            <p>You now have full access to all platform features.</p>
            {{/if}}
            <p>For any questions or concerns, please don't hesitate to reach out to our support team.</p>
            <br>
            <p>Best regards,<br>Wedding Management Team</p>
          </body>
        </html>
      `,
      textContent:
        'Account Status Update: {{#if isSuspended}}Your account has been suspended. Contact support if you believe this is an error.{{else}}Your account suspension has been lifted and is now active.{{/if}} For questions, contact our support team. Best regards, Wedding Management Team',
    },
  ];

  // Create email templates for each notification detail
  for (const notificationDetail of allNotificationDetails) {
    for (const template of emailTemplates) {
      await prisma.emailTemplate.create({
        data: {
          name: `${template.name} - NotificationDetail ${notificationDetail.id}`,
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          notificationDetailsId: notificationDetail.id,
        },
      });
    }
  }

  // Create notification history (10 entries per wedding notification detail)
  const notificationHistoryTemplates = [
    {
      to: ['couple@wedding.com'],
      subject: 'Welcome to Wedding Planning!',
      body: "Welcome to our platform! We're here to help you plan your perfect wedding.",
      type: EmailTemplateType.WELCOME,
    },
    {
      to: ['wedding@email.com'],
      subject: 'Password Reset Request',
      body: 'You requested a password reset. Click the link to reset your password.',
      type: EmailTemplateType.PASSWORD_RESET,
    },
    {
      to: ['couple@email.com'],
      subject: 'Email Verification Required',
      body: 'Please verify your email address to complete your account setup.',
      type: EmailTemplateType.VERIFY_EMAIL,
    },
    {
      to: ['admin@wedding.com'],
      subject: 'Account Created Successfully',
      body: 'Your wedding planning account has been created successfully.',
      type: EmailTemplateType.CREATE_ACCOUNT,
    },
    {
      to: ['couple@email.com'],
      subject: 'Venue Booking Confirmed',
      body: 'Great news! Your venue booking has been confirmed for your special day.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['wedding@email.com'],
      subject: 'Wedding Planning Reminder',
      body: "Don't forget to confirm your catering arrangements by next week!",
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['couple@email.com'],
      subject: 'Guest RSVP Update',
      body: 'Several guests have updated their RSVP status for your wedding.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['wedding@email.com'],
      subject: 'Wedding Countdown - 30 Days!',
      body: "Your special day is just 30 days away! Here's your final checklist.",
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['couple@email.com'],
      subject: 'Vendor Update Notification',
      body: 'One of your vendors has updated their service details.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['wedding@email.com'],
      subject: 'Budget Tracking Alert',
      body: 'Your wedding budget tracker has been updated with recent expenses.',
      type: EmailTemplateType.CUSTOM,
    },
  ];

  // Create 10 notification history entries for each wedding's notification details
  const weddingNotificationDetails = allNotificationDetails.filter(
    (nd) => nd.weddingId !== null,
  );

  for (const notificationDetail of weddingNotificationDetails) {
    for (let i = 0; i < notificationHistoryTemplates.length; i++) {
      const template = notificationHistoryTemplates[i];

      await prisma.emailNotificationHistory.create({
        data: {
          to: template.to,
          subject: template.subject,
          body: template.body,
          type: template.type,
          notificationDetailsId: notificationDetail.id,
          sentAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date in last 30 days
        },
      });
    }
  }

  // Create vendor notification history templates
  const vendorNotificationHistoryTemplates = [
    {
      to: ['vendor@business.com'],
      subject: 'Welcome to Knotly Vendor Platform!',
      body: 'Welcome to Knotly! Your vendor account has been created successfully.',
      type: EmailTemplateType.WELCOME,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Password Reset Request',
      body: 'You requested a password reset for your vendor account.',
      type: EmailTemplateType.PASSWORD_RESET,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Email Verification Required',
      body: 'Please verify your email address to activate your vendor account.',
      type: EmailTemplateType.VERIFY_EMAIL,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Vendor Account Setup Complete',
      body: 'Your vendor account has been successfully set up and is ready to use.',
      type: EmailTemplateType.CREATE_ACCOUNT,
    },
    {
      to: ['vendor@business.com'],
      subject: 'New Booking Request Received',
      body: 'Great news! You have received a new booking request from a couple.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Vendor Profile Updated',
      body: 'Your vendor profile has been successfully updated with new information.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['vendor@business.com'],
      subject: 'New Review Posted',
      body: 'A couple has left a review for your services. Check your dashboard to view it.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Payment Received',
      body: 'Payment has been received for your recent wedding service booking.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Vendor Status Update',
      body: 'Your vendor onboarding status has been updated.',
      type: EmailTemplateType.CUSTOM,
    },
    {
      to: ['vendor@business.com'],
      subject: 'Monthly Performance Report',
      body: 'Your monthly vendor performance report is now available.',
      type: EmailTemplateType.CUSTOM,
    },
  ];

  // Create 10 notification history entries for each vendor's notification details
  const vendorNotificationDetails = allNotificationDetails.filter(
    (nd) => nd.vendorId !== null,
  );

  for (const notificationDetail of vendorNotificationDetails) {
    for (let i = 0; i < vendorNotificationHistoryTemplates.length; i++) {
      const template = vendorNotificationHistoryTemplates[i];

      await prisma.emailNotificationHistory.create({
        data: {
          to: template.to,
          subject: template.subject,
          body: template.body,
          type: template.type,
          notificationDetailsId: notificationDetail.id,
          sentAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date in last 30 days
        },
      });
    }
  }

  console.log('✅ Created email templates and notification history');

  // Create listings for vendors
  console.log('✅ Creating listings...');

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

  for (let i = 0; i < weddings.length; i++) {
    const wedding = weddings[i];
    const primaryGuestCount = 80; // Reduce primary guests to make room for accompanying guests

    for (let j = 0; j < primaryGuestCount; j++) {
      const name = `${guestNames[j % guestNames.length]} ${j > guestNames.length ? j : ''}`;

      // Create primary guest
      const primaryGuest = await prisma.guest.create({
        data: {
          name: name.trim(),
          email: `guest${i + 1}_${j + 1}@example.com`,
          allergies:
            Math.random() > 0.7
              ? allergies[Math.floor(Math.random() * allergies.length)]
              : null,
          group: groups[Math.floor(Math.random() * groups.length)],
          confirmationStatus:
            Math.random() > 0.2
              ? ConfirmationStatus.CONFIRMED
              : ConfirmationStatus.PENDING,
          weddingId: wedding.id,
        },
      });

      // 30% chance to have accompanying guests
      if (Math.random() < 0.3) {
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
        }
      }
    }

    console.log(
      `✅ Created ~${primaryGuestCount} primary guests with accompanying guests for ${wedding.name}`,
    );
  }

  console.log('Database seeded successfully!');
  console.log(`Created:`);
  console.log(`- 1 Super Admin`);
  console.log(`- 10 Admin users (5 couples)`);
  console.log(`- 20 Vendor users`);
  console.log(`- 5 Weddings`);
  console.log(`- 25 Notification Details (5 for weddings, 20 for vendors)`);
  console.log(`- 125 Email Templates (5 per notification detail)`);
  console.log(
    `- 250 Email Notification History entries (10 per wedding + 10 per vendor)`,
  );
  console.log(
    `- ~80 primary guests per wedding (some with accompanying guests)`,
  );
  console.log(`- ~30% of primary guests have 1-3 accompanying guests each`);
  console.log(
    `- Accompanying guests have individual confirmation status and dietary requirements`,
  );
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
