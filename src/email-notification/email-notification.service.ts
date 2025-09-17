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
