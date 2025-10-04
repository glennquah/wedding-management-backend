import { EmailTemplateType, PrismaClient } from '@prisma/client';

export async function seedEmailHistory(prisma: PrismaClient) {
  console.log('✅ Seeding email notification history...');

  // Get only notification details that belong to weddings or vendors
  const allNotificationDetails = await prisma.notificationDetails.findMany({
    where: {
      OR: [{ weddingId: { not: null } }, { vendorId: { not: null } }],
    },
  });

  // Notification history templates for weddings
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

  // Vendor notification history templates
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

  console.log(
    `✅ Created ${weddingNotificationDetails.length * 10} wedding email notification history entries`,
  );
  console.log(
    `✅ Created ${vendorNotificationDetails.length * 10} vendor email notification history entries`,
  );
}
