import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AiServiceService } from '../ai-service/ai-service.service';
import { EmailTemplateResponse } from '../ai-service/interfaces/email-template-response.interface';
import { BroadcastRsvpInvitationDto } from './dto/broadcast-rsvp-invitation.dto';
import { GenerateAiEmailTemplateDto } from './dto/generate-ai-email-template.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendRsvpInvitationDto } from './dto/send-rsvp-invitation.dto';
import { SendSingleEmailDto } from './dto/send-single-email.dto';
import { EmailNotificationService } from './email-notification.service';
import { EmailTemplateType } from './enums/email-template.enum';

@ApiTags('email-notification')
@Controller('email-notification')
@UseGuards(JwtGuard, RolesGuard)
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly aiService: AiServiceService,
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

  @Post('send-rsvp-invitation')
  @ApiOperation({ summary: 'Send RSVP invitation email to a guest' })
  @ApiResponse({
    status: 201,
    description: 'The RSVP invitation email has been successfully sent.',
  })
  async sendRsvpInvitation(
    @Body() rsvpData: SendRsvpInvitationDto,
  ): Promise<void> {
    await this.emailNotificationService.createRsvpDetails(
      rsvpData.guestId,
      rsvpData.weddingId,
    );
  }

  @Post('broadcast-rsvp-invitations')
  @ApiOperation({
    summary: 'Broadcast RSVP invitation emails to multiple guests',
  })
  @ApiResponse({
    status: 201,
    description: 'The RSVP invitation emails have been processed.',
  })
  async broadcastRsvpInvitations(
    @Body() broadcastData: BroadcastRsvpInvitationDto,
  ): Promise<void> {
    await this.emailNotificationService.broadcastRsvpInvitations(
      broadcastData.guestIds,
      broadcastData.weddingId,
    );
  }

  @Post('generate-ai-template/:weddingId')
  @ApiOperation({
    summary: 'Generate an AI-powered email template',
    description:
      'Uses AI to generate a custom HTML email template based on provided parameters. Returns both the HTML template and a suggested subject line.',
  })
  @ApiResponse({
    status: 201,
    description: 'Email template successfully generated.',
    type: EmailTemplateResponse,
  })
  async getAIEmailTemplate(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() generateDto: GenerateAiEmailTemplateDto,
  ): Promise<EmailTemplateResponse> {
    return this.emailNotificationService.getAIEmailTemplate(
      weddingId,
      generateDto,
    );
  }
}
