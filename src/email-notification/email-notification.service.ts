import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailNotificationService {
  constructor() {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    sgMail.setApiKey(key);
  }

  async sendEmail(to: string, subject: string, text: string, html: string) {
    const msg = {
      to,
      from: 'test@example.com',
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent');
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
