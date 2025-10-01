import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { NotificationDetailsService } from '../notification-details/notification-details.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { EmailTemplateType } from './enums/email-template.enum';
import {
  CreateAccountData,
  EmailTemplateData,
  PasswordResetData,
  VerifyEmailData,
  WelcomeEmailData,
} from './interfaces/email-template-data.interface';

@Injectable()
export class EmailNotificationService {
  private readonly templateDir = path.join(
    process.cwd(),
    'src',
    'email-notification',
    'email-templates',
  );
  private templates: Map<string, HandlebarsTemplateDelegate<any>> = new Map();

  constructor(private notificationDetailsService: NotificationDetailsService) {
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
}
