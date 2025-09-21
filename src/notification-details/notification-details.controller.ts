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
import { CreateEmailTemplateDto } from './dtos/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dtos/update-email-template.dto';
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
  ) {
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
  })
  async getEmailTemplatesForWedding(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ) {
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
  })
  async getEmailTemplateWithId(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
  ) {
    return this.notificationDetailsService.getEmailTemplateWithId(
      emailTemplateId,
    );
  }

  @Put('email-templates/:emailTemplateId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update email template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Email template updated successfully.',
  })
  async updateEmailTemplateInWedding(
    @Param('emailTemplateId', ParseIntPipe) emailTemplateId: number,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
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
  ) {
    return this.notificationDetailsService.deleteEmailTemplate(emailTemplateId);
  }
}
