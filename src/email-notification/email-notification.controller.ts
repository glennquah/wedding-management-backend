import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailTemplateType } from './enums/email-template.enum';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendSingleEmailDto } from './dto/send-single-email.dto';
import { EmailNotificationService } from './email-notification.service';

@ApiTags('email-notification')
@Controller('email-notification')
@UseGuards(JwtGuard, RolesGuard)
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
  async sendEmail(@Body() emailData: SendSingleEmailDto): Promise<void> {
    await this.emailNotificationService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
      emailData.html,
      EmailTemplateType.CUSTOM,
      emailData.weddingId,
      emailData.vendorId,
    );
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk email notifications' })
  @ApiResponse({
    status: 201,
    description: 'The emails have been successfully sent.',
  })
  async sendBulkEmail(@Body() bulkEmailData: SendBulkEmailDto): Promise<void> {
    await this.emailNotificationService.sendBulkEmail(
      bulkEmailData,
      EmailTemplateType.CUSTOM,
      bulkEmailData.weddingId,
    );
  }
}
