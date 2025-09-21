import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { EmailTemplate } from './enums/email-template.enum';
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

  constructor() {
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
        { name: EmailTemplate.PASSWORD_RESET, file: 'password-reset.html' },
        { name: EmailTemplate.WELCOME, file: 'welcome.html' },
        { name: EmailTemplate.VERIFY_EMAIL, file: 'verify-email.html' },
        { name: EmailTemplate.CREATE_ACCOUNT, file: 'create-account.html' },
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
  ) {
    const templateData: PasswordResetData = {
      name,
      buttonUrl: resetLink,
    };

    await this.sendPasswordResetEmail(to, templateData);
  }

  async sendWelcomeEmail(to: string, userName: string, dashboardUrl: string) {
    const templateData: WelcomeEmailData = {
      userName,
      dashboardUrl,
    };

    await this.sendWelcomeEmailTemplate(to, templateData);
  }

  async sendVerifyEmail(to: string, verifyUrl: string, name: string = 'there') {
    const templateData: VerifyEmailData = {
      name,
      verifyUrl,
    };

    await this.sendVerifyEmailTemplate(to, templateData);
  }

  async sendCreateAccountEmail(
    to: string,
    signupUrl: string,
    name: string,
    weddingName: string,
    inviterName: string,
  ) {
    const templateData: CreateAccountData = {
      name,
      weddingName,
      inviterName,
      signupUrl,
    };

    await this.sendCreateAccountTemplate(to, templateData);
  }

  async sendPasswordResetEmail(
    to: string,
    templateData: PasswordResetData,
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplate.PASSWORD_RESET,
      templateData,
    );
    const text = this.generatePasswordResetPlainText(templateData);

    await this.sendEmail(to, 'Reset Your Knotly Password', text, html);
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

  async sendWelcomeEmailTemplate(
    to: string,
    templateData: WelcomeEmailData,
  ): Promise<void> {
    const html = this.renderTemplate(EmailTemplate.WELCOME, templateData);
    const text = this.generateWelcomeEmailTemplatePlainText(templateData);

    await this.sendEmail(
      to,
      "Welcome to Knotly - Let's Plan Your Dream Wedding!",
      text,
      html,
    );
  }

  private generateWelcomeEmailTemplatePlainText(
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

  async sendVerifyEmailTemplate(
    to: string,
    templateData: VerifyEmailData,
  ): Promise<void> {
    const html = this.renderTemplate(EmailTemplate.VERIFY_EMAIL, templateData);
    const text = this.generateVerifyEmailPlainText(templateData);

    await this.sendEmail(to, 'Verify Your Knotly Email', text, html);
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
  ): Promise<void> {
    const html = this.renderTemplate(
      EmailTemplate.CREATE_ACCOUNT,
      templateData,
    );
    const text = this.generateCreateAccountPlainText(templateData);

    await this.sendEmail(
      to,
      "You've Been Invited to Plan a Wedding!",
      text,
      html,
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
  ): Promise<void> {
    const msg = {
      to,
      from: {
        email: 'hello@knotly.app',
        name: 'Knotly Team',
      },
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendBulkEmail(bulkEmailData: SendBulkEmailDto): Promise<void> {
    const messages = bulkEmailData.emails.map((email) => ({
      to: email,
      from: 'hello.knotly@gmail.com',
      subject: bulkEmailData.subject,
      text: bulkEmailData.text,
      html: bulkEmailData.html,
    }));

    try {
      await sgMail.send(messages);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
