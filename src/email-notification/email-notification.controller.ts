import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailNotificationService } from './email-notification.service';

@Controller('email-notification')
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email notification' })
  @ApiResponse({
    status: 201,
    description: 'The email has been successfully sent.',
  })
  async sendEmail(
    @Body()
    emailData: {
      to: string;
      subject: string;
      text: string;
      html: string;
    },
  ) {
    return await this.emailNotificationService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
      emailData.html,
    );
  }
}
