import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DatingPartnerCommission,
  EmailTemplateType,
  Guest,
  OrderStatus,
} from '@prisma/client';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { AiServiceService } from 'src/ai-service/ai-service.service';
import { EmailTemplateResponse } from 'src/ai-service/interfaces/email-template-response.interface';
import { VendorOnboardingStatus } from 'src/common/vendor-onboarding-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { WeddingService } from 'src/wedding/wedding.service';
import { NotificationDetailsService } from '../notification-details/notification-details.service';
import { GenerateAiEmailTemplateDto } from './dto/generate-ai-email-template.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import {
  AdminSuspensionData,
  CalendarAccessRequestData,
  CollaboratorAddedData,
  CollaboratorGratitudeCardData,
  CreateAccountData,
  DatingPlatformPayoutData,
  EmailTemplateData,
  GuestGratitudeCardData,
  PasswordResetData,
  RegisterDatingUserData,
  RsvpInvitationData,
  SuperAdminOnboardingData,
  VendorBookingConfirmationData,
  VendorBookingRejectionData,
  VendorGratitudeCardData,
  VendorListingDeletionData,
  VendorStatusData,
  VendorSuspensionData,
  VerifyEmailData,
  WelcomeEmailData,
} from './interfaces/email-template-data.interface';

@Injectable()
export class EmailNotificationService {
  private readonly templateDir =
    process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'email-templates') // Lambda: copied by webpack
      : path.join(
          process.cwd(),
          'src',
          'email-notification',
          'email-templates',
        ); // Local dev

  private templates: Map<string, HandlebarsTemplateDelegate<any>> = new Map();

  constructor(
    private notificationDetailsService: NotificationDetailsService,
    private prisma: PrismaService,
    private aiService: AiServiceService,
    private weddingService: WeddingService,
  ) {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    sgMail.setApiKey(key);
    this.loadTemplates();
  }

  private loadTemplates(): void {
    try {
      const templateFiles = [
        { name: EmailTemplateType.PASSWORD_RESET, file: 'password-reset.html' },
        { name: EmailTemplateType.WELCOME, file: 'welcome.html' },
        { name: EmailTemplateType.VERIFY_EMAIL, file: 'verify-email.html' },
        { name: EmailTemplateType.CREATE_ACCOUNT, file: 'create-account.html' },
        {
          name: EmailTemplateType.SUPER_ADMIN_ONBOARDING,
          file: 'super-admin-onboarding.html',
        },
        { name: EmailTemplateType.VENDOR_STATUS, file: 'vendor-status.html' },
        {
          name: EmailTemplateType.VENDOR_SUSPENSION,
          file: 'vendor-suspension.html',
        },
        {
          name: EmailTemplateType.ADMIN_SUSPENSION,
          file: 'admin-suspension.html',
        },
        {
          name: EmailTemplateType.GUEST_GRATITUDE_CARD,
          file: 'guest-gratitude-card.html',
        },
        {
          name: EmailTemplateType.COLLABORATOR_GRATITUDE_CARD,
          file: 'collaborator-gratitude-card.html',
        },
        {
          name: EmailTemplateType.VENDOR_GRATITUDE_CARD,
          file: 'vendor-gratitude-card.html',
        },
        {
          name: EmailTemplateType.RSVP_INVITATION,
          file: 'rsvp-invitation.html',
        },
        {
          name: EmailTemplateType.COLLABORATOR_ADDED,
          file: 'collaborator-added.html',
        },
        {
          name: EmailTemplateType.CALENDAR_ACCESS_REQUEST,
          file: 'calendar-access-request.html',
        },
        {
          name: EmailTemplateType.VENDOR_BOOKING_CONFIRMATION,
          file: 'vendor-booking-confirmation.html',
        },
        {
          name: EmailTemplateType.VENDOR_BOOKING_REJECTION,
          file: 'vendor-booking-rejection.html',
        },
        {
          name: EmailTemplateType.REGISTER_DATING_USER,
          file: 'create-dating-user-account.html',
        },
        {
          name: EmailTemplateType.DATING_PLATFORM_PAYOUT,
          file: 'dating-platform-payout.html',
        },
        {
          name: EmailTemplateType.VENDOR_LISTING_DELETION,
          file: 'vendor-listing-deletion.html',
        },
      ];

      templateFiles.forEach(({ name, file }) => {
        const templatePath = path.join(this.templateDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        this.templates.set(name, Handlebars.compile(templateContent));
      });
    } catch (error) {
      console.error('Error loading email templates:', error);
      throw new Error('Failed to load email templates');
    }
  }

  private renderTemplate(
    templateName: string,
    data: EmailTemplateData,
  ): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template(data);
  }

  async sendForgetPasswordEmail(
    to: string,
    resetLink: string,
    name: string = 'there',
  ): Promise<void> {
    const templateData: PasswordResetData = {
      name,
      buttonUrl: resetLink,
    };

    await this.sendPasswordResetEmail(to, templateData);
  }

  async sendSuperAdminCreatedEmail(
    to: string,
    name: string,
    resetLink: string,
    dashboardUrl: string,
  ): Promise<void> {
    const supportEmail = 'hello.knotly@gmail.com';

    const templateData: SuperAdminOnboardingData = {
      name,
      buttonUrl: resetLink,
      dashboardUrl,
      supportEmail,
    };

    const html = this.renderTemplate(
      EmailTemplateType.SUPER_ADMIN_ONBOARDING,
      templateData,
    );
    const text = `Hello ${name}!

Welcome to the Knotly Super Admin team. Use the link below to set your password and activate your account.

${resetLink}

The link expires in 7 days. If you weren't expecting this invitation, let us know at ${supportEmail}.

Once you're set up, visit your dashboard at ${dashboardUrl} to get started.

Best regards,
The Knotly Team`;

    await this.sendEmail(
      to,
      'Knotly Super Admin Access - Set Up Your Account',
      text,
      html,
      EmailTemplateType.SUPER_ADMIN_ONBOARDING,
    );
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    dashboardUrl: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: WelcomeEmailData = {
      userName,
      dashboardUrl,
    };

    await this.sendWelcomeEmailTemplateType(to, templateData, weddingId);
  }

  async sendVerifyEmail(
    to: string,
    verifyUrl: string,
    name: string = 'there',
    weddingId?: number,
  ): Promise<void> {
    const templateData: VerifyEmailData = {
      name,
      verifyUrl,
    };

    await this.sendVerifyEmailTemplateType(to, templateData, weddingId);
  }

  async sendRegisterDatingUserEmail(
    to: string,
    resetPasswordUrl: string,
    name: string,
  ): Promise<void> {
    const templateData: RegisterDatingUserData = {
      name,
      resetPasswordUrl,
    };

    await this.sendRegisterDatingUserTemplate(to, templateData);
  }

  async sendCreateAccountEmail(
    to: string,
    resetPasswordUrl: string,
    name: string,
    weddingName: string,
    inviterName: string,
    weddingId?: number,
    isPartner?: boolean,
  ): Promise<void> {
    const templateData: CreateAccountData = {
      name,
      weddingName,
      inviterName,
      resetPasswordUrl,
    };

    await this.sendCreateAccountTemplate(
      to,
      templateData,
      weddingId,
      isPartner,
    );
  }

  async sendPasswordResetEmail(
    to: string,
    templateData: PasswordResetData,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.PASSWORD_RESET,
      templateData,
    );
    const text = this.generatePasswordResetPlainText(templateData);

    await this.sendEmail(
      to,
      'Reset Your Knotly Password',
      text,
      html,
      EmailTemplateType.PASSWORD_RESET,
    );
  }

  private generatePasswordResetPlainText(
    templateData: PasswordResetData,
  ): string {
    return `Hello ${templateData.name}!

    We received a request to reset your password for your Knotly account. Click the link below to create a new password.

    Reset Password: ${templateData.buttonUrl}

    If you didn't request this password reset, please ignore this email. The link will expire in 24 hours for security.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendWelcomeEmailTemplateType(
    to: string,
    templateData: WelcomeEmailData,
    weddingId: number,
  ): Promise<void> {
    const html = this.renderTemplate(EmailTemplateType.WELCOME, templateData);
    const text = this.generateWelcomeEmailTemplateTypePlainText(templateData);

    await this.sendEmail(
      to,
      "Welcome to Knotly - Let's Plan Your Dream Wedding!",
      text,
      html,
      EmailTemplateType.WELCOME,
      weddingId,
    );
  }

  private generateWelcomeEmailTemplateTypePlainText(
    templateData: WelcomeEmailData,
  ): string {
    return `Welcome ${templateData.userName}!

    We're thrilled to have you join the Knotly family! Your wedding planning journey starts here, and we're here to help you every step of the way.

    Start Planning: ${templateData.dashboardUrl}

    Need help getting started? Our support team is always ready to assist you. Happy planning!

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVerifyEmailTemplateType(
    to: string,
    templateData: VerifyEmailData,
    weddingId: number,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.VERIFY_EMAIL,
      templateData,
    );
    const text = this.generateVerifyEmailPlainText(templateData);

    await this.sendEmail(
      to,
      'Verify Your Knotly Email',
      text,
      html,
      EmailTemplateType.VERIFY_EMAIL,
      weddingId,
    );
  }

  private generateVerifyEmailPlainText(templateData: VerifyEmailData): string {
    return `Hello ${templateData.name}!

    Welcome to Knotly! To complete your account setup, please verify your email address by clicking the link below.

    Verify Email: ${templateData.verifyUrl}

    If you didn't create an account with Knotly, please ignore this email. The verification link will expire in 24 hours for security.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendCreateAccountTemplate(
    to: string,
    templateData: CreateAccountData,
    weddingId: number,
    isPartner?: boolean,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.CREATE_ACCOUNT,
      templateData,
    );
    const text = this.generateCreateAccountPlainText(templateData, isPartner);

    const subject = isPartner
      ? "You've Been Invited to Plan Your Wedding!"
      : "You've Been Invited to Plan a Wedding!";

    await this.sendEmail(
      to,
      subject,
      text,
      html,
      EmailTemplateType.CREATE_ACCOUNT,
      weddingId,
    );
  }

  private generateCreateAccountPlainText(
    templateData: CreateAccountData,
    isPartner?: boolean,
  ): string {
    const greeting = `Hello ${templateData.name}!`;
    const message = isPartner
      ? `Great news! You've been invited by your partner to plan your wedding together on Knotly! An account has been created for you.`
      : `Great news! You've been invited to help plan and coordinate an upcoming wedding. An account has been created for you on Knotly!`;
    const action = isPartner
      ? `To get started, click the link below to set your password for your new account. Once you've set your password, you can log in and start planning your special day together!`
      : `To get started, click the link below to set your password for your new account. Once you've set your password, you can log in and start collaborating!`;

    return `${greeting}

    ${message}

    Wedding Details:
    Wedding: ${templateData.weddingName}
    Invited by: ${templateData.inviterName}

    ${action}

    Set Your Password: ${templateData.resetPasswordUrl}

    If you don't want to join this wedding planning team, you can safely ignore this email. This link will expire in 7 days.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendRegisterDatingUserTemplate(
    to: string,
    templateData: RegisterDatingUserData,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.REGISTER_DATING_USER,
      templateData,
    );
    const text = this.generateRegisterDatingUserPlainText(templateData);

    await this.sendEmail(
      to,
      "Welcome to Knotly! Let's Start Your Wedding Journey",
      text,
      html,
      EmailTemplateType.REGISTER_DATING_USER,
    );
  }

  private generateRegisterDatingUserPlainText(
    templateData: RegisterDatingUserData,
  ): string {
    const greeting = `Hello ${templateData.name}!`;

    const bannerTitle = `Your Wedding Journey Starts Now!`;
    const bannerSubtitle = `Welcome to Knotly, from our partners at Ai Stead Mai.`;

    const message1 = `We're thrilled to have you! As a partner of Ai Stead Mai, we're here to help you take the next exciting step: planning your perfect wedding.`;

    const message2 = `An account has been created for you on Knotly, your all-in-one platform for finding vendors, managing your guest list, tracking budgets, and bringing your dream day to life.`;

    const action = `To get started, click the button below to set the password for your new account. Once you're in, you can start planning!`;

    const ctaLink = `Set Your Password: ${templateData.resetPasswordUrl}`;

    const footerNote = `If you did not request this, you can safely ignore this email. This secure link will expire in 7 days.`;

    return `${bannerTitle}
  ${bannerSubtitle}
  
  ${greeting}
  
  ${message1}
  
  ${message2}
  
  ${action}
  
  ${ctaLink}
  
  ${footerNote}
    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendCollaboratorAddedEmail(
    to: string,
    name: string,
    weddingName: string,
    inviterName: string,
    loginUrl: string,
    weddingId?: number,
    isPartner?: boolean,
  ): Promise<void> {
    const templateData: CollaboratorAddedData = {
      name,
      weddingName,
      inviterName,
      loginUrl,
    };

    await this.sendCollaboratorAddedTemplate(
      to,
      templateData,
      weddingId,
      isPartner,
    );
  }

  async sendCollaboratorAddedTemplate(
    to: string,
    templateData: CollaboratorAddedData,
    weddingId: number,
    isPartner?: boolean,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.COLLABORATOR_ADDED,
      templateData,
    );
    const text = this.generateCollaboratorAddedPlainText(
      templateData,
      isPartner,
    );

    const subject = isPartner
      ? "You've Been Invited to Plan Your Wedding!"
      : "You've Been Added as a Collaborator!";

    await this.sendEmail(
      to,
      subject,
      text,
      html,
      EmailTemplateType.COLLABORATOR_ADDED,
      weddingId,
    );
  }

  private generateCollaboratorAddedPlainText(
    templateData: CollaboratorAddedData,
    isPartner?: boolean,
  ): string {
    const greeting = `Hello ${templateData.name}!`;
    const message = isPartner
      ? `You've been invited by your partner to plan your wedding together on Knotly!`
      : `You've been added as a collaborator to help plan an upcoming wedding!`;

    return `${greeting}

    ${message}

    Wedding Details:
    Wedding: ${templateData.weddingName}
    ${isPartner ? 'Invited by' : 'Added by'}: ${templateData.inviterName}

    Log in to your Knotly account to access the wedding dashboard and start collaborating with the team!

    Log In: ${templateData.loginUrl}

    If you have any questions, feel free to reach out to the person who invited you or contact our support team.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async createRsvpDetails(guestId: number, weddingId: number): Promise<void> {
    // Fetch guest data
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    if (!guest.email) {
      throw new NotFoundException(
        `Guest with ID ${guestId} does not have an email`,
      );
    }

    // Fetch wedding data with microsite
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { microsite: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    if (!wedding.microsite) {
      throw new NotFoundException(
        `Wedding with ID ${weddingId} does not have a microsite`,
      );
    }

    // Craft RSVP URL
    const micrositeUrl = `${process.env.FRONTEND_URL}/microsite/${wedding.microsite.slug}`;
    const nameParts = guest.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const rsvpUrl = `${micrositeUrl}?password=${encodeURIComponent(wedding.microsite.password || '')}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;

    // Send the email
    await this.sendRsvpInvitationEmail(
      guest.email,
      guest.name,
      wedding.name,
      rsvpUrl,
      weddingId,
    );
  }

  async broadcastRsvpInvitations(
    guestIds: number[],
    weddingId: number,
  ): Promise<void> {
    // Verify wedding exists with microsite once
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { microsite: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    if (!wedding.microsite) {
      throw new NotFoundException(
        `Wedding with ID ${weddingId} does not have a microsite`,
      );
    }

    // Process each guest
    for (const guestId of guestIds) {
      try {
        await this.createRsvpDetails(guestId, weddingId);
      } catch (error) {
        throw new Error(
          `Failed to send RSVP to guest ID ${guestId}: ${error.message}`,
        );
      }
    }
  }

  async sendRsvpInvitationEmail(
    to: string,
    name: string,
    weddingName: string,
    rsvpUrl: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: RsvpInvitationData = {
      name,
      weddingName,
      rsvpUrl,
    };

    const html = this.renderTemplate(
      EmailTemplateType.RSVP_INVITATION,
      templateData,
    );
    const text = this.generateRsvpInvitationPlainText(templateData);

    await this.sendEmail(
      to,
      `You're Invited to ${weddingName}!`,
      text,
      html,
      EmailTemplateType.RSVP_INVITATION,
      weddingId,
    );
  }

  private generateRsvpInvitationPlainText(
    templateData: RsvpInvitationData,
  ): string {
    return `Dear ${templateData.name},

    We are delighted to invite you to our special day! Your presence would mean the world to us as we celebrate our love and commitment.

    Wedding: ${templateData.weddingName}

    Please click the link below to RSVP and let us know if you can join us for this joyous occasion. Your response will help us ensure everything is perfect for our big day.

    RSVP Now: ${templateData.rsvpUrl}

    We look forward to celebrating with you! If you have any questions, please don't hesitate to reach out.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVendorStatusEmail(
    to: string,
    vendorName: string,
    onboardingStatus: VendorOnboardingStatus,
    vendorId?: number,
  ): Promise<void> {
    const templateData: VendorStatusData = {
      vendorName,
      vendorOnboardingStatus: onboardingStatus,
      dashboardUrl: process.env.FRONTEND_URL,
      isPending: onboardingStatus === VendorOnboardingStatus.PENDING,
      isRejected: onboardingStatus === VendorOnboardingStatus.REJECTED,
      isOnboarded: onboardingStatus === VendorOnboardingStatus.ONBOARDED,
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_STATUS,
      templateData,
    );
    const text = this.generateVendorStatusPlainText(templateData);

    await this.sendEmail(
      to,
      'Vendor Account Status Update - Knotly',
      text,
      html,
      EmailTemplateType.VENDOR_STATUS,
      undefined,
      vendorId,
    );
  }

  private generateVendorStatusPlainText(
    templateData: VendorStatusData,
  ): string {
    let statusMessage = '';

    if (templateData.isPending) {
      statusMessage =
        'Your vendor application is currently under review. We will notify you once the review is complete.';
    } else if (templateData.isOnboarded) {
      statusMessage =
        'Congratulations! Your vendor account has been approved. You can now start receiving bookings and managing your services.';
    } else if (templateData.isRejected) {
      statusMessage =
        'Unfortunately, your vendor application has been rejected. Please contact our support team for more information.';
    }

    return `Hello ${templateData.vendorName}!

    Your vendor account status has been updated.

    New Status: ${templateData.vendorOnboardingStatus.toUpperCase()}

    ${statusMessage}

    Access your dashboard: ${templateData.dashboardUrl}

    If you have any questions, please contact our support team.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVendorSuspensionEmail(
    to: string,
    vendorName: string,
    isSuspended: boolean,
    vendorId?: number,
  ): Promise<void> {
    const templateData: VendorSuspensionData = {
      vendorName,
      isSuspended,
      isActive: !isSuspended,
      dashboardUrl: process.env.FRONTEND_URL || 'https://knotly.app',
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_SUSPENSION,
      templateData,
    );
    const text = this.generateVendorSuspensionPlainText(templateData);

    const subject = isSuspended
      ? 'Vendor Account Suspended - Knotly'
      : 'Vendor Account Reactivated - Knotly';

    await this.sendEmail(
      to,
      subject,
      text,
      html,
      EmailTemplateType.VENDOR_SUSPENSION,
      undefined,
      vendorId,
    );
  }

  private generateVendorSuspensionPlainText(
    templateData: VendorSuspensionData,
  ): string {
    if (templateData.isSuspended) {
      return `Hello ${templateData.vendorName}!

    Your vendor account has been temporarily suspended.

    What does this mean?
    While your account is suspended, you will have limited access to the platform. Your vendor profile is not visible to couples, and you cannot receive new booking requests.

    What you can do:
    • Review our vendor terms and conditions
    • Contact our support team to understand the reason for suspension
    • Provide any requested documentation or information
    • Work with us to resolve any outstanding issues

    Access your dashboard: ${templateData.dashboardUrl}

    If you have any questions, please contact our support team at support@knotly.app.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
    } else {
      return `Hello ${templateData.vendorName}!

    Great news! Your vendor account suspension has been lifted.

    Welcome back!
    Your account is now fully active. You can continue receiving booking requests and managing your services on the platform.

    Next steps:
    • Update your vendor profile and availability
    • Review any pending booking requests
    • Ensure your service listings are up to date
    • Start connecting with couples planning their special day

    Access your dashboard: ${templateData.dashboardUrl}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
    }
  }

  async sendAdminSuspensionEmail(
    to: string,
    adminName: string,
    isSuspended: boolean,
    weddingId?: number,
  ): Promise<void> {
    const templateData: AdminSuspensionData = {
      adminName,
      isSuspended,
      isActive: !isSuspended,
      dashboardUrl: process.env.FRONTEND_URL || 'https://knotly.app',
    };

    const html = this.renderTemplate(
      EmailTemplateType.ADMIN_SUSPENSION,
      templateData,
    );
    const text = this.generateAdminSuspensionPlainText(templateData);

    const subject = isSuspended
      ? 'Account Suspended - Knotly'
      : 'Account Reactivated - Knotly';

    await this.sendEmail(
      to,
      subject,
      text,
      html,
      EmailTemplateType.ADMIN_SUSPENSION,
      weddingId,
    );
  }

  private generateAdminSuspensionPlainText(
    templateData: AdminSuspensionData,
  ): string {
    if (templateData.isSuspended) {
      return `Hello ${templateData.adminName}!

    Your account has been temporarily suspended.

    What does this mean?
    While your account is suspended, you will have limited access to the platform. You may not be able to access certain features or make changes to your wedding plans.

    What you can do:
    • Review our terms and conditions
    • Contact our support team to understand the reason for suspension
    • Provide any requested information or documentation
    • Work with us to resolve any outstanding issues

    Access your dashboard: ${templateData.dashboardUrl}

    If you have any questions, please contact our support team at support@knotly.app.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
    } else {
      return `Hello ${templateData.adminName}!

    Great news! Your account suspension has been lifted.

    Welcome back!
    Your account is now fully active. You can continue planning your dream wedding with full access to all platform features.

    Continue your wedding journey:
    • Review your wedding timeline and checklist
    • Browse and book vendors for your special day
    • Manage your guest list and RSVPs
    • Collaborate with your wedding team

    Access your dashboard: ${templateData.dashboardUrl}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
    }
  }

  async sendCalendarAccessRequest(
    to: string,
    name: string,
    weddingName: string,
    authUrl: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: CalendarAccessRequestData = {
      name,
      weddingName,
      buttonUrl: authUrl,
    };

    const htmlContent = this.renderTemplate(
      EmailTemplateType.CALENDAR_ACCESS_REQUEST,
      templateData,
    );

    const textContent = `Hi ${name}!

You've been requested to connect your Google Calendar to help optimize the wedding date for ${weddingName}.

How It Works:
- We'll check your calendar availability
- Our AI will suggest dates when everyone is free
- You can disconnect anytime
- We only read availability, not event details

Click the link below to securely connect your Google Calendar:
${authUrl}

Your Privacy Matters: We only access your calendar to check if you're free or busy. We never read event titles, descriptions, or any other details.

Questions about calendar access? Contact the wedding planner or reach out to our support team.

---
Knotly - Your Perfect Wedding, Perfectly Planned
Website: https://knotly.app`;

    await this.sendEmail(
      to,
      'Calendar Access Request for Wedding Planning',
      textContent,
      htmlContent,
      EmailTemplateType.CALENDAR_ACCESS_REQUEST,
      weddingId,
    );
  }

  async broadcastGuestGratitude(weddingId: number): Promise<void> {
    // Fetch wedding data
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        gratitudeCard: true,
        guests: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    if (!wedding.gratitudeCard) {
      throw new NotFoundException(
        `Wedding with ID ${weddingId} does not have a gratitudeCard`,
      );
    }

    const primaryGuests: Guest[] = wedding.guests.filter(
      (guest) => guest.email && guest.email.trim() !== '' && guest.attendance,
    );

    // Process each guest
    for (const guest of primaryGuests) {
      try {
        await this.sendGuestGratitudeEmail(
          guest.email,
          guest.name,
          wedding.gratitudeCard.signOffName,
          wedding.gratitudeCard.guestCardMessage,
          wedding.gratitudeCard.guestCardPhotoURL,
          wedding.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          weddingId,
        );
      } catch (error) {
        console.error(
          `Failed to send gratitude email to guest ${guest.name} (${guest.id}): ${error.message}`,
        );
      }
    }
  }

  async sendGuestGratitudeEmail(
    to: string,
    name: string,
    signOff: string,
    message: string,
    photoUrl: string,
    weddingDate: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: GuestGratitudeCardData = {
      guestName: name,
      signOff,
      message,
      photoUrl,
      weddingDate,
    };

    const html = this.renderTemplate(
      EmailTemplateType.GUEST_GRATITUDE_CARD,
      templateData,
    );
    const text = this.generateGuestGratitudePlainText(templateData);

    await this.sendEmail(
      to,
      `A Heartfelt Thank You!`,
      text,
      html,
      EmailTemplateType.GUEST_GRATITUDE_CARD,
      weddingId,
    );
  }

  private generateGuestGratitudePlainText(
    templateData: GuestGratitudeCardData,
  ): string {
    return `Dear ${templateData.guestName},

    Having you with us on our wedding day meant the world. We wanted to share this small note to express our heartfelt thanks.

    ${templateData.message}

    Cheers,
    ${templateData.signOff}

    ${templateData.weddingDate}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async broadcastCollaboratorGratitude(weddingId: number): Promise<void> {
    // Fetch wedding data
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        mainCouple: true,
        admins: {
          include: {
            user: true,
          },
        },
        gratitudeCard: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    if (!wedding.gratitudeCard) {
      throw new NotFoundException(
        `Wedding with ID ${weddingId} does not have a gratitudeCard`,
      );
    }

    const mainCoupleIds = new Set(
      wedding.mainCouple.map((user) => user.userId),
    );

    const collaborators = wedding.admins.filter(
      (admin) => !mainCoupleIds.has(admin.userId),
    );

    // Process each guest
    for (const collaborator of collaborators) {
      try {
        await this.sendCollaboratorGratitudeEmail(
          collaborator.user.email,
          collaborator.user.name,
          wedding.gratitudeCard.signOffName,
          wedding.gratitudeCard.collaboratorCardMessage,
          wedding.gratitudeCard.collaboratorCardPhotoURL,
          wedding.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          weddingId,
        );
      } catch (error) {
        console.error(
          `Failed to send gratitude email to collaborator ${collaborator.user.name} (${collaborator.user.id}): ${error.message}`,
        );
      }
    }
  }

  async sendCollaboratorGratitudeEmail(
    to: string,
    name: string,
    signOff: string,
    message: string,
    photoUrl: string,
    weddingDate: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: CollaboratorGratitudeCardData = {
      collaboratorName: name,
      signOff,
      message,
      photoUrl,
      weddingDate,
    };

    const html = this.renderTemplate(
      EmailTemplateType.COLLABORATOR_GRATITUDE_CARD,
      templateData,
    );
    const text = this.generateCollaboratorGratitudePlainText(templateData);

    await this.sendEmail(
      to,
      `A Special Thank You!`,
      text,
      html,
      EmailTemplateType.COLLABORATOR_GRATITUDE_CARD,
      weddingId,
    );
  }

  private generateCollaboratorGratitudePlainText(
    templateData: CollaboratorGratitudeCardData,
  ): string {
    return `Dear ${templateData.collaboratorName},

    We couldn't have done it without you. Thank you for being such an essential part of our wedding journey. We wanted to share this note of appreciation.

    Thank you!

    ------------------------------

    ${templateData.message}

    Love you,
    ${templateData.signOff}

    ${templateData.weddingDate}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async broadcastVendorGratitude(weddingId: number): Promise<void> {
    // Fetch wedding data
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        gratitudeCard: true,
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    if (!wedding.gratitudeCard) {
      throw new NotFoundException(
        `Wedding with ID ${weddingId} does not have a gratitudeCard`,
      );
    }

    // filter for vendor
    const vendors = await this.prisma.vendor.findMany({
      where: {
        listings: {
          some: {
            orders: {
              some: {
                order: {
                  weddingId: weddingId,
                  orderStatus: OrderStatus.COMPLETED,
                },
              },
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Process each guest
    for (const vendor of vendors) {
      try {
        await this.sendVendorGratitudeEmail(
          vendor.user.email,
          vendor.user.name,
          wedding.gratitudeCard.signOffName,
          wedding.gratitudeCard.vendorCardMessage,
          wedding.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          weddingId,
        );
      } catch (error) {
        console.error(
          `Failed to send gratitude email to vendor ${vendor.user.name} (${vendor.userId}): ${error.message}`,
        );
      }
    }
  }

  async sendVendorGratitudeEmail(
    to: string,
    name: string,
    signOff: string,
    message: string,
    weddingDate: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: VendorGratitudeCardData = {
      vendorName: name,
      signOff,
      message,
      weddingDate,
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_GRATITUDE_CARD,
      templateData,
    );
    const text = this.generateVendorGratitudePlainText(templateData);

    await this.sendEmail(
      to,
      `A Heartfelt Thank You!`,
      text,
      html,
      EmailTemplateType.VENDOR_GRATITUDE_CARD,
      weddingId,
    );
  }

  private generateVendorGratitudePlainText(
    templateData: VendorGratitudeCardData,
  ): string {
    return `Dear ${templateData.vendorName},

    Our wedding day was perfect, and you were a huge part of that. We wanted to send a special thank you for your incredible work.

    Thank you!
    For being our vendor

    ------------------------------

    ${templateData.message}

    With much gratitude,
    ${templateData.signOff}

    ${templateData.weddingDate}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVendorBookingConfirmationEmail(
    coupleEmail: string,
    coupleName: string,
    vendorName: string,
    listingName: string,
    weddingDate: string,
    amount: string,
    orderId: number,
    weddingId?: number,
  ): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'https://knotly.app';
    const dashboardUrl = weddingId
      ? `${baseUrl}/wedding/${weddingId}/orders`
      : baseUrl;

    const templateData: VendorBookingConfirmationData = {
      vendorName,
      coupleName,
      listingName,
      weddingDate,
      amount,
      orderId,
      dashboardUrl,
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_BOOKING_CONFIRMATION,
      templateData,
    );
    const text = this.generateVendorBookingConfirmationPlainText(templateData);

    await this.sendEmail(
      coupleEmail,
      'Booking Confirmed - Knotly',
      text,
      html,
      EmailTemplateType.VENDOR_BOOKING_CONFIRMATION,
      weddingId,
    );
  }

  private generateVendorBookingConfirmationPlainText(
    templateData: VendorBookingConfirmationData,
  ): string {
    return `Hello ${templateData.coupleName}!

    Great news! ${templateData.vendorName} has confirmed your booking request.
    You're one step closer to making your dream wedding a reality!

    Booking Details:
    - Vendor: ${templateData.vendorName}
    - Service: ${templateData.listingName}
    - Wedding Date: ${templateData.weddingDate}
    - Booking Amount: ${templateData.amount}
    - Order ID: #${templateData.orderId}
    - Status: CONFIRMED

    Next Steps:
    • Review the booking details in your dashboard
    • Coordinate with your vendor to finalize arrangements
    • Keep track of your wedding timeline and tasks

    View in Dashboard: ${templateData.dashboardUrl}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVendorBookingRejectionEmail(
    coupleEmail: string,
    coupleName: string,
    vendorName: string,
    listingName: string,
    weddingDate: string,
    amount: string,
    orderId: number,
    weddingId?: number,
  ): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'https://knotly.app';
    const dashboardUrl = weddingId
      ? `${baseUrl}/wedding/${weddingId}/orders`
      : baseUrl;

    const templateData: VendorBookingRejectionData = {
      vendorName,
      coupleName,
      listingName,
      weddingDate,
      amount,
      orderId,
      dashboardUrl,
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_BOOKING_REJECTION,
      templateData,
    );
    const text = this.generateVendorBookingRejectionPlainText(templateData);

    await this.sendEmail(
      coupleEmail,
      'Booking Request Declined - Knotly',
      text,
      html,
      EmailTemplateType.VENDOR_BOOKING_REJECTION,
      weddingId,
    );
  }

  private generateVendorBookingRejectionPlainText(
    templateData: VendorBookingRejectionData,
  ): string {
    return `Hello ${templateData.coupleName}!

    We regret to inform you that ${templateData.vendorName} was unable to accept your booking request.
    A full refund has been processed automatically and will be returned to your payment method.

    Booking Details:
    - Vendor: ${templateData.vendorName}
    - Service: ${templateData.listingName}
    - Wedding Date: ${templateData.weddingDate}
    - Refunded Amount: ${templateData.amount}
    - Order ID: #${templateData.orderId}
    - Status: DECLINED

    What's Next:
    • Browse our marketplace to find alternative vendors
    • Your refund will appear within 5-10 business days
    • You can book other services for your wedding
    • Contact support if you have any questions about the refund

    We understand this may be disappointing, but we're here to help you find the perfect vendor for your special day.

    Find Other Vendors: ${templateData.dashboardUrl}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendDatingPlatformPayoutEmail(
    to: string,
    data: DatingPartnerCommission,
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<void> {
    const templateData: DatingPlatformPayoutData = {
      partnerName: process.env.PARTNER_CONTACT_NAME,
      commissionId: data.id,
      payoutDate: data.updatedAt.toLocaleDateString(),
      stripeTransferId: data.stripeTransferId,
      currency: data.currency,
      commissionRatePercent: (data.commissionRate * 100).toFixed(1),
      commissionAmount: data.commissionAmount.toFixed(2),
    };

    const html = this.renderTemplate(
      EmailTemplateType.DATING_PLATFORM_PAYOUT,
      templateData,
    );
    const text = this.generateDatingPlatformPayoutPlainText(
      templateData,
      process.env.PARTNER_CONTACT_NAME,
    );

    // Create pdf attachment object
    const attachment = {
      content: pdfBuffer.toString('base64'),
      filename: filename,
      type: 'application/pdf',
      disposition: 'attachment',
    };

    await this.sendEmail(
      to,
      `Your Commission Payout from Knotly (ID: ${data.stripeTransferId})`,
      text,
      html,
      EmailTemplateType.DATING_PLATFORM_PAYOUT,
      undefined,
      undefined,
      [attachment],
    );
  }

  private generateDatingPlatformPayoutPlainText(
    templateData: DatingPlatformPayoutData,
    partnerName: string,
  ): string {
    const greeting = `Hello ${partnerName}!`;
    const message1 = `You have received a new commission payout. This payment has been successfully transferred to your connected Stripe account.`;
    const message2 = `A full, itemized commission statement (PDF) is attached to this email for your records.`;
    const footerNote = `Thank you for your partnership! If you have any questions about this payout, please contact us at support@knotly.app.`;

    return `
    ${greeting}
    ${message1}

    ---
    Commission Details:
    Commission ID: #${templateData.commissionId}
    Payout Date: ${templateData.payoutDate}
    Stripe Transfer ID: ${templateData.stripeTransferId}
    Commission Rate: ${templateData.commissionRatePercent}%
    Commission Earned: ${templateData.currency} ${templateData.commissionAmount} 
    ---

    ${message2}
    ${footerNote}

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendVendorListingDeletionEmail(
    vendorId: number,
    listingName: string,
    dateRemoved: string,
    reasonForRemoval: string,
  ): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: {
        user: true,
      },
    });

    const templateData: VendorListingDeletionData = {
      vendorName: vendor.user.name,
      listingName: listingName,
      dateRemoved: dateRemoved,
      reasonForRemoval: reasonForRemoval,
    };

    const html = this.renderTemplate(
      EmailTemplateType.VENDOR_LISTING_DELETION,
      templateData,
    );
    const text = this.generateVendorListingDeletionPlainText(templateData);

    await this.sendEmail(
      vendor.user.email,
      'Vendor Listing Deletion - Knotly',
      text,
      html,
      EmailTemplateType.VENDOR_LISTING_DELETION,
      undefined,
      vendorId,
    );
  }

  private generateVendorListingDeletionPlainText(
    templateData: VendorListingDeletionData,
  ): string {
    return `Hello ${templateData.vendorName}!

    We are writing to inform you that your listing, "${templateData.listingName}", has been removed from the Knotly platform by an administrator.

    Removed Listing Details:
    - Listing Name: ${templateData.listingName}
    - Date Removed: ${templateData.dateRemoved}

    Reason for Removal:
    ${templateData.reasonForRemoval}

    If you have any questions, believe this is an error, or wish to discuss this further, please reply directly to this email. Our support team will review your inquiry and get back to you.

    ---
    Knotly - Your Perfect Wedding, Perfectly Planned
    Website: https://knotly.app`;
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
    type: EmailTemplateType,
    weddingId?: number,
    vendorId?: number,
    attachments?: any[],
  ): Promise<void> {
    const msg: any = {
      to,
      from: {
        email: 'hello.knotly@gmail.com',
        name: 'Knotly Team',
      },
      subject,
      text,
      html,
    };

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments;
    }

    try {
      await sgMail.send(msg);

      // Log to notification history if weddingId or vendorId is provided
      if (weddingId) {
        await this.notificationDetailsService.createEmailNotification({
          to: [to],
          subject,
          body: html,
          type,
          weddingId,
        });
      } else if (vendorId) {
        await this.notificationDetailsService.createEmailNotification({
          to: [to],
          subject,
          body: html,
          type,
          vendorId,
        });
      } else {
        console.log(`Email sent (no wedding context): ${type} to ${to}`);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendBulkEmail(
    bulkEmailData: SendBulkEmailDto,
    type: EmailTemplateType,
    weddingId?: number,
  ): Promise<void> {
    const messages = bulkEmailData.emails.map((email) => ({
      to: email,
      from: 'hello.knotly@gmail.com',
      subject: bulkEmailData.subject,
      text: bulkEmailData.text || 'Please view this email in HTML format.',
      html: bulkEmailData.html,
    }));

    try {
      await sgMail.send(messages);

      if (weddingId) {
        await this.notificationDetailsService.createEmailNotification({
          to: bulkEmailData.emails,
          subject: bulkEmailData.subject,
          body: bulkEmailData.html,
          type,
          weddingId,
        });
      }
    } catch (error) {
      console.error('SendGrid Bulk Email Error:', error);
      if (error.response?.body?.errors) {
        console.error(
          'SendGrid Bulk Email Error Details:',
          JSON.stringify(error.response.body.errors, null, 2),
        );
      }
      throw error;
    }
  }

  async getAIEmailTemplate(
    weddingId: number,
    generateDto: GenerateAiEmailTemplateDto,
  ): Promise<EmailTemplateResponse> {
    const weddingDetails = await this.weddingService.findById(weddingId);
    return this.aiService.generateEmailTemplate(generateDto, weddingDetails);
  }
}
