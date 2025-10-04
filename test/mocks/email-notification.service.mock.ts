import { Injectable } from '@nestjs/common';
import { VendorOnboardingStatus } from '../../src/common/vendor-onboarding-status.enum';
import { SendBulkEmailDto } from '../../src/email-notification/dto/send-bulk-email.dto';
import { EmailTemplateType } from '@prisma/client';
import {
  CreateAccountData,
  PasswordResetData,
  VerifyEmailData,
  WelcomeEmailData,
} from '../../src/email-notification/interfaces/email-template-data.interface';

@Injectable()
export class MockEmailNotificationService {
  // Store sent emails for test verification
  public sentEmails: Array<{
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    type: EmailTemplateType;
    weddingId?: number;
    vendorId?: number;
    timestamp: Date;
  }> = [];

  // Clear sent emails between tests
  public clearSentEmails(): void {
    this.sentEmails = [];
  }

  // Mock implementation that just stores the email data
  async sendForgetPasswordEmail(
    to: string,
    resetLink: string,
    name: string = 'there',
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Reset Your Knotly Password',
      text: `Password reset for ${name}`,
      html: `<p>Password reset for ${name}</p>`,
      type: EmailTemplateType.PASSWORD_RESET,
      timestamp: new Date(),
    });
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    dashboardUrl: string,
    weddingId?: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: "Welcome to Knotly - Let's Plan Your Dream Wedding!",
      text: `Welcome ${userName}!`,
      html: `<p>Welcome ${userName}!</p>`,
      type: EmailTemplateType.WELCOME,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendSuperAdminCreatedEmail(
    to: string,
    name: string,
    resetLink: string,
    dashboardUrl: string,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Knotly Super Admin Access - Set Up Your Account',
      text: `Super admin onboarding for ${name}. Reset link: ${resetLink}. Dashboard: ${dashboardUrl}`,
      html: `<p>Super admin onboarding for ${name}. Reset link: ${resetLink}. Dashboard: ${dashboardUrl}</p>`,
      type: EmailTemplateType.SUPER_ADMIN_ONBOARDING,
      timestamp: new Date(),
    });
  }

  async sendVerifyEmail(
    to: string,
    verifyUrl: string,
    name: string = 'there',
    weddingId?: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Verify Your Knotly Email',
      text: `Verify email for ${name}`,
      html: `<p>Verify email for ${name}</p>`,
      type: EmailTemplateType.VERIFY_EMAIL,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendCreateAccountEmail(
    to: string,
    signupUrl: string,
    name: string,
    weddingName: string,
    inviterName: string,
    weddingId?: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: "You've Been Invited to Plan a Wedding!",
      text: `Account creation for ${name}`,
      html: `<p>Account creation for ${name}</p>`,
      type: EmailTemplateType.CREATE_ACCOUNT,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendVendorStatusEmail(
    to: string,
    vendorName: string,
    onboardingStatus: VendorOnboardingStatus,
    vendorId?: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Vendor Account Status Update - Knotly',
      text: `Vendor status update for ${vendorName}`,
      html: `<p>Vendor status update for ${vendorName}</p>`,
      type: EmailTemplateType.VENDOR_STATUS,
      vendorId,
      timestamp: new Date(),
    });
  }

  async sendVendorSuspensionEmail(
    to: string,
    vendorName: string,
    isSuspended: boolean,
    vendorId?: number,
  ): Promise<void> {
    const subject = isSuspended
      ? 'Vendor Account Suspended - Knotly'
      : 'Vendor Account Reactivated - Knotly';

    this.sentEmails.push({
      to,
      subject,
      text: `Vendor suspension update for ${vendorName}`,
      html: `<p>Vendor suspension update for ${vendorName}</p>`,
      type: EmailTemplateType.VENDOR_SUSPENSION,
      vendorId,
      timestamp: new Date(),
    });
  }

  async sendAdminSuspensionEmail(
    to: string,
    adminName: string,
    isSuspended: boolean,
    weddingId?: number,
  ): Promise<void> {
    const subject = isSuspended
      ? 'Account Suspended - Knotly'
      : 'Account Reactivated - Knotly';

    this.sentEmails.push({
      to,
      subject,
      text: `Admin suspension update for ${adminName}`,
      html: `<p>Admin suspension update for ${adminName}</p>`,
      type: EmailTemplateType.ADMIN_SUSPENSION,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendBulkEmail(
    bulkEmailData: SendBulkEmailDto,
    type: EmailTemplateType,
    weddingId?: number,
  ): Promise<void> {
    this.sentEmails.push({
      to: bulkEmailData.emails,
      subject: bulkEmailData.subject,
      text: bulkEmailData.text,
      html: bulkEmailData.html,
      type,
      weddingId,
      timestamp: new Date(),
    });
  }

  // Additional methods from the real service
  async sendPasswordResetEmail(
    to: string,
    templateData: PasswordResetData,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Reset Your Knotly Password',
      text: `Password reset for ${templateData.name}`,
      html: `<p>Password reset for ${templateData.name}</p>`,
      type: EmailTemplateType.PASSWORD_RESET,
      timestamp: new Date(),
    });
  }

  async sendWelcomeEmailTemplateType(
    to: string,
    templateData: WelcomeEmailData,
    weddingId: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: "Welcome to Knotly - Let's Plan Your Dream Wedding!",
      text: `Welcome ${templateData.userName}!`,
      html: `<p>Welcome ${templateData.userName}!</p>`,
      type: EmailTemplateType.WELCOME,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendVerifyEmailTemplateType(
    to: string,
    templateData: VerifyEmailData,
    weddingId: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: 'Verify Your Knotly Email',
      text: `Verify email for ${templateData.name}`,
      html: `<p>Verify email for ${templateData.name}</p>`,
      type: EmailTemplateType.VERIFY_EMAIL,
      weddingId,
      timestamp: new Date(),
    });
  }

  async sendCreateAccountTemplate(
    to: string,
    templateData: CreateAccountData,
    weddingId: number,
  ): Promise<void> {
    this.sentEmails.push({
      to,
      subject: "You've Been Invited to Plan a Wedding!",
      text: `Account creation for ${templateData.name}`,
      html: `<p>Account creation for ${templateData.name}</p>`,
      type: EmailTemplateType.CREATE_ACCOUNT,
      weddingId,
      timestamp: new Date(),
    });
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
    this.sentEmails.push({
      to,
      subject,
      text,
      html,
      type,
      weddingId,
      vendorId,
      timestamp: new Date(),
    });
  }

  // Helper methods for tests
  public getLastSentEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  public getSentEmailsCount(): number {
    return this.sentEmails.length;
  }

  public getSentEmailsByType(type: EmailTemplateType) {
    return this.sentEmails.filter((email) => email.type === type);
  }

  public getSentEmailsToRecipient(recipient: string) {
    return this.sentEmails.filter((email) =>
      Array.isArray(email.to)
        ? email.to.includes(recipient)
        : email.to === recipient,
    );
  }
}
