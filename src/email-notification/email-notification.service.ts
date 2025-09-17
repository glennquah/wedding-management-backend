import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

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
      from: 'hello.knotly@gmail.com',
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

  async sendBulkEmail(bulkEmailData: SendBulkEmailDto) {
    const messages = bulkEmailData.emails.map((email) => ({
      to: email,
      from: 'hello.knotly@gmail.com',
      subject: bulkEmailData.subject,
      text: bulkEmailData.text,
      html: bulkEmailData.html,
    }));

    try {
      await sgMail.send(messages);
      console.log(`${messages.length} emails sent`);
      return {
        success: true,
        message: `${messages.length} emails sent successfully`,
        count: messages.length,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
