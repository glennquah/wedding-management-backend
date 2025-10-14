import { Injectable, NotFoundException } from '@nestjs/common';
import { Admin, Guest, OrderStatus, User } from '@prisma/client';
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
import { EmailTemplateType } from './enums/email-template.enum';
import {
  AdminSuspensionData,
  CollaboratorGratitudeCardData,
  CreateAccountData,
  EmailTemplateData,
  GuestGratitudeCardData,
  PasswordResetData,
  VendorGratitudeCardData,
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

  async sendCreateAccountEmail(
    to: string,
    signupUrl: string,
    name: string,
    weddingName: string,
    inviterName: string,
    weddingId?: number,
  ): Promise<void> {
    const templateData: CreateAccountData = {
      name,
      weddingName,
      inviterName,
      signupUrl,
    };

    await this.sendCreateAccountTemplate(to, templateData, weddingId);
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
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplateType.CREATE_ACCOUNT,
      templateData,
    );
    const text = this.generateCreateAccountPlainText(templateData);

    await this.sendEmail(
      to,
      "You've Been Invited to Plan a Wedding!",
      text,
      html,
      EmailTemplateType.CREATE_ACCOUNT,
      weddingId,
    );
  }

  private generateCreateAccountPlainText(
    templateData: CreateAccountData,
  ): string {
    return `Hello ${templateData.name}!

    Great news! You've been invited to help plan and coordinate an upcoming wedding. Join the team and be part of making this special day perfect!

    Wedding Details:
    Wedding: ${templateData.weddingName}
    Invited by: ${templateData.inviterName}

    Click the link below to create your account and start collaborating on this amazing wedding journey!

    Create Account: ${templateData.signupUrl}

    If you don't want to join this wedding planning team, you can safely ignore this email. The invitation link will expire in 7 days.

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
          `Failed to send gratitude email to vendor ${vendor.user.name} (${vendor.userId}): ${error.user.message}`,
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

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
    type: EmailTemplateType,
    weddingId?: number,
    vendorId?: number,
  ): Promise<void> {
    const msg = {
      to,
      from: {
        email: 'hello.knotly@gmail.com',
        name: 'Knotly Team',
      },
      subject,
      text,
      html,
    };

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
