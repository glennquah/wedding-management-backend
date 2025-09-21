import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmailTemplateType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmailTemplateDto,
  EmailNotificationHistoryResponseDto,
  EmailNotificationHistoryWithWeddingDto,
  EmailTemplateResponseDto,
  EmailTemplateWithWeddingDto,
  UpdateEmailTemplateDto,
} from './dtos';

@Injectable()
export class NotificationDetailsService {
  constructor(private prisma: PrismaService) {}

  async createEmailTemplateInWedding(
    weddingId: number,
    dto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateResponseDto> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { notificationDetails: true },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    return this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        htmlContent: dto.htmlContent,
        textContent: dto.textContent,
        notificationDetailsId: wedding.notificationDetails.id,
      },
    });
  }

  async updateEmailTemplateInWedding(
    emailTemplateId: number,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateResponseDto> {
    const existingTemplate = await this.prisma.emailTemplate.findUnique({
      where: { id: emailTemplateId },
    });

    if (!existingTemplate) {
      throw new NotFoundException(
        `Email template with ID ${emailTemplateId} not found`,
      );
    }

    return this.prisma.emailTemplate.update({
      where: { id: emailTemplateId },
      data: dto,
    });
  }

  async getEmailTemplateWithId(
    emailTemplateId: number,
  ): Promise<EmailTemplateWithWeddingDto> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: emailTemplateId },
      include: {
        notificationDetails: {
          include: {
            wedding: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(
        `Email template with ID ${emailTemplateId} not found`,
      );
    }

    return template;
  }

  async getAllEmailTemplates(): Promise<EmailTemplateWithWeddingDto[]> {
    return this.prisma.emailTemplate.findMany({
      include: {
        notificationDetails: {
          include: {
            wedding: true,
          },
        },
      },
    });
  }

  async deleteEmailTemplate(
    emailTemplateId: number,
  ): Promise<EmailTemplateResponseDto> {
    const existingTemplate = await this.prisma.emailTemplate.findUnique({
      where: { id: emailTemplateId },
    });

    if (!existingTemplate) {
      throw new NotFoundException(
        `Email template with ID ${emailTemplateId} not found`,
      );
    }

    return this.prisma.emailTemplate.delete({
      where: { id: emailTemplateId },
    });
  }

  async getEmailTemplatesForWedding(
    weddingId: number,
  ): Promise<EmailTemplateResponseDto[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        notificationDetails: {
          include: {
            emailTemplates: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    return wedding.notificationDetails.emailTemplates;
  }

  async getEmailNotificationHistoryWithWeddingId(
    weddingId: number,
  ): Promise<EmailNotificationHistoryResponseDto[]> {
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        notificationDetails: {
          include: {
            emailNotificationHistory: true,
          },
        },
      },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${weddingId} not found`);
    }

    return wedding.notificationDetails.emailNotificationHistory;
  }

  async getEmailNotificationHistoryWithVendorId(
    vendorId: number,
  ): Promise<EmailNotificationHistoryResponseDto[]> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: vendorId },
      include: {
        notificationDetails: {
          include: {
            emailNotificationHistory: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    if (!vendor.notificationDetails) {
      return [];
    }

    return vendor.notificationDetails.emailNotificationHistory;
  }

  async getAllEmailNotificationHistory(): Promise<
    EmailNotificationHistoryWithWeddingDto[]
  > {
    return this.prisma.emailNotificationHistory.findMany({
      include: {
        notificationDetails: {
          include: {
            wedding: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  async deleteEmailNotificationHistory(
    historyId: number,
  ): Promise<EmailNotificationHistoryResponseDto> {
    const existingHistory =
      await this.prisma.emailNotificationHistory.findUnique({
        where: { id: historyId },
      });

    if (!existingHistory) {
      throw new NotFoundException(
        `Email notification history with ID ${historyId} not found`,
      );
    }

    return this.prisma.emailNotificationHistory.delete({
      where: { id: historyId },
    });
  }

  async createEmailNotification(data: {
    to: string[];
    subject: string;
    body: string;
    type: EmailTemplateType;
    weddingId?: number;
    vendorId?: number;
  }): Promise<EmailNotificationHistoryResponseDto> {
    if (!data.weddingId && !data.vendorId) {
      throw new BadRequestException(
        'Either weddingId or vendorId must be provided',
      );
    }

    if (data.weddingId && data.vendorId) {
      throw new BadRequestException(
        'Cannot provide both weddingId and vendorId',
      );
    }

    let notificationDetailsId: number;

    if (data.weddingId) {
      const wedding = await this.prisma.wedding.findUnique({
        where: { id: data.weddingId },
        include: { notificationDetails: true },
      });

      if (!wedding) {
        throw new NotFoundException(
          `Wedding with ID ${data.weddingId} not found`,
        );
      }

      if (!wedding.notificationDetails) {
        throw new NotFoundException(
          `Notification details not found for wedding with ID ${data.weddingId}`,
        );
      }

      notificationDetailsId = wedding.notificationDetails.id;
    } else {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: data.vendorId },
        include: { notificationDetails: true },
      });

      if (!vendor) {
        throw new NotFoundException(
          `Vendor with ID ${data.vendorId} not found`,
        );
      }

      if (!vendor.notificationDetails) {
        throw new NotFoundException(
          `Notification details not found for vendor with ID ${data.vendorId}`,
        );
      }

      notificationDetailsId = vendor.notificationDetails.id;
    }

    return this.prisma.emailNotificationHistory.create({
      data: {
        to: data.to,
        subject: data.subject,
        body: data.body,
        type: data.type,
        notificationDetailsId,
      },
    });
  }
}
