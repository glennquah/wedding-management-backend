import { PrismaClient } from '@prisma/client';

export async function seedEmailTemplates(prisma: PrismaClient) {
  console.log('✅ Seeding email templates...');

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

  // Get only notification details that belong to weddings or vendors
  const allNotificationDetails = await prisma.notificationDetails.findMany({
    where: {
      OR: [{ weddingId: { not: null } }, { vendorId: { not: null } }],
    },
  });

  // Email template data for weddings and vendors
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

  console.log('✅ Created email templates for weddings and vendors');
}
