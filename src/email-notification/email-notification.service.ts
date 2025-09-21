import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

export interface PasswordResetData {
  name: string;
  buttonUrl: string;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export type EmailTemplateData = PasswordResetData | WelcomeEmailData;

export enum EmailTemplate {
  PASSWORD_RESET = 'password-reset',
  WELCOME = 'welcome',
}

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
    Website: https://knotly.com`;
  }

  async sendWelcomeEmailTemplate(
    to: string,
    templateData: WelcomeEmailData,
  ): Promise<void> {
    const html = this.renderTemplate(EmailTemplate.WELCOME, templateData);
    const text = `Welcome ${templateData.userName}!

We're thrilled to have you join the Knotly family! Your wedding planning journey starts here, and we're here to help you every step of the way.

Start Planning: ${templateData.dashboardUrl}

Need help getting started? Our support team is always ready to assist you. Happy planning!

---
Knotly - Your Perfect Wedding, Perfectly Planned
Website: https://knotly.com`;

    await this.sendEmail(
      to,
      "Welcome to Knotly - Let's Plan Your Dream Wedding!",
      text,
      html,
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const msg = {
      to,
      from: 'hello.knotly@gmail.com',
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
