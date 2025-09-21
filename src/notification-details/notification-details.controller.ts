import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/user-role.enum';
import {
  CreateEmailTemplateDto,
  EmailNotificationHistoryResponseDto,
  EmailTemplateResponseDto,
  EmailTemplateWithWeddingDto,
  UpdateEmailTemplateDto,
} from './dtos';
import { AllEmailNotificationHistoryResponseDto } from './dtos/all-email-notification-history-response.dto';
import { NotificationDetailsService } from './notification-details.service';

@ApiTags('notification-details')
@Controller('notification-details')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationDetailsController {
  constructor(
    private readonly notificationDetailsService: NotificationDetailsService,
  ) {}

  @Post('weddings/:weddingId/email-templates')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create email template for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'The email template has been successfully created.',
  })
  async createEmailTemplateInWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() dto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateResponseDto> {
    return this.notificationDetailsService.createEmailTemplateInWedding(
      weddingId,
      dto,
    );
  }

  @Get('weddings/:weddingId/email-templates')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all email templates for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Email templates retrieved successfully.',
    type: [EmailTemplateResponseDto],
  })
  async getEmailTemplatesForWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<EmailTemplateResponseDto[]> {
    return this.notificationDetailsService.getEmailTemplatesForWedding(
      weddingId,
    );
  }

  @Get('email-templates/:emailTemplateId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email template retrieved successfully.',
    type: EmailTemplateWithWeddingDto,
  })
  async getEmailTemplateWithId(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
  ): Promise<EmailTemplateWithWeddingDto> {
    return this.notificationDetailsService.getEmailTemplateWithId(
      emailTemplateId,
    );
  }

  @Get('email-templates')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({
    status: 200,
    description: 'Email templates retrieved successfully.',
    type: [EmailTemplateWithWeddingDto],
  })
  async getAllEmailTemplates(): Promise<EmailTemplateWithWeddingDto[]> {
    return this.notificationDetailsService.getAllEmailTemplates();
  }

  @Put('email-templates/:emailTemplateId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update email template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email template updated successfully.',
    type: EmailTemplateResponseDto,
  })
  async updateEmailTemplateInWedding(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
    @Body() dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateResponseDto> {
    return this.notificationDetailsService.updateEmailTemplateInWedding(
      emailTemplateId,
      dto,
    );
  }

  @Delete('email-templates/:emailTemplateId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete email template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email template deleted successfully.',
  })
  async deleteEmailTemplate(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
  ): Promise<EmailTemplateResponseDto> {
    return this.notificationDetailsService.deleteEmailTemplate(emailTemplateId);
  }

  @Get('weddings/:weddingId/email-notification-history')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get email notification history for a wedding' })
  @ApiResponse({
    status: 200,
    description: 'Email notification history retrieved successfully.',
    type: [EmailNotificationHistoryResponseDto],
  })
  async getEmailNotificationHistoryWithWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<EmailNotificationHistoryResponseDto[]> {
    return this.notificationDetailsService.getEmailNotificationHistoryWithWeddingId(
      weddingId,
    );
  }

  @Get('vendors/:vendorId/email-notification-history')
  @Roles(UserRole.VENDOR, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get email notification history for a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Email notification history retrieved successfully.',
    type: [EmailNotificationHistoryResponseDto],
  })
  async getEmailNotificationHistoryWithVendorId(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<EmailNotificationHistoryResponseDto[]> {
    return this.notificationDetailsService.getEmailNotificationHistoryWithVendorId(
      vendorId,
    );
  }

  @Get('email-notification-history')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Get all email notification history (SuperAdmin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All email notification history retrieved successfully.',
    type: [AllEmailNotificationHistoryResponseDto],
  })
  async getAllEmailNotificationHistory(): Promise<
    AllEmailNotificationHistoryResponseDto[]
  > {
    return this.notificationDetailsService.getAllEmailNotificationHistory();
  }

  @Delete('email-notification-history/:historyId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete email notification history by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email notification history deleted successfully.',
    type: EmailNotificationHistoryResponseDto,
  })
  async deleteEmailNotificationHistory(
    @Param('historyId', ParseIntPipe) historyId: number,
  ): Promise<EmailNotificationHistoryResponseDto> {
    return this.notificationDetailsService.deleteEmailNotificationHistory(
      historyId,
    );
  }
}
