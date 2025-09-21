import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmailTemplateDto } from './dtos/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dtos/update-email-template.dto';

@Injectable()
export class NotificationDetailsService {
  constructor(private prisma: PrismaService) {}

  async createEmailTemplateInWedding(
    weddingId: number,
    dto: CreateEmailTemplateDto,
  ) {
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
  ) {
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

  async getEmailTemplateWithId(emailTemplateId: number) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: emailTemplateId },
      include: {
        NotificationDetails: {
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

  async getAllEmailTemplates() {
    return this.prisma.emailTemplate.findMany({
      include: {
        NotificationDetails: {
          include: {
            wedding: true,
          },
        },
      },
    });
  }

  async deleteEmailTemplate(emailTemplateId: number) {
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

  async getEmailTemplatesForWedding(weddingId: number) {
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
}
