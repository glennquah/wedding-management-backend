import { Injectable } from '@nestjs/common';
import { Wedding } from '@prisma/client';
import OpenAI from 'openai';
import { GenerateAiEmailTemplateDto } from '../email-notification/dto/generate-ai-email-template.dto';
import {
  CreateMicrositeDto,
  FaqItemDto,
  ScheduleItemDto,
} from '../microsite/dto/create-microsite.dto';
import { GenerateMicrositeDto } from '../microsite/dto/generate-microsite.dto';
import { EmailTemplateResponse } from './interfaces/email-template-response.interface';
import { generateEmailTemplatePrompt } from './prompts/email-template.prompt';
import { generateMicrositePrompt } from './prompts/microsite.prompt';

interface GeneratedMicrositeContent {
  templateNumber: number;
  slug: string;
  coupleName: string;
  heroImages: string[];
  imageGallery: string[];
  schedule: ScheduleItemDto[];
  faqs: FaqItemDto[];
}

@Injectable()
export class AiServiceService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async getJsonCompletion<T>(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
    },
  ): Promise<T> {
    const completion = await this.client.chat.completions.create({
      model: options?.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;

    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      throw new Error('OpenAI did not return valid JSON');
    }
  }

  async generateEmailTemplate(
    dto: GenerateAiEmailTemplateDto,
    weddingDetails?: any,
  ): Promise<EmailTemplateResponse> {
    const brandName = weddingDetails?.name || 'Knotly';
    const tone = dto.tone || 'friendly';

    // Build microsite URL if wedding has microsite
    const micrositeUrl = weddingDetails?.microsite?.slug
      ? `${process.env.FRONTEND_URL}/microsite/${weddingDetails.microsite.slug}`
      : null;

    // Build Google Maps URL if location is provided (from DTO or wedding details)
    // Priority: DTO mapLocation > wedding location
    const location = dto.mapLocation || weddingDetails?.location;
    const locationMapUrl = location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
      : null;

    // Extract wedding information if available
    const weddingContext = weddingDetails
      ? `
        WEDDING CONTEXT (use this to personalize the email):
          - Wedding Name: ${weddingDetails.name || 'N/A'}
          - Wedding Date: ${weddingDetails.date ? new Date(weddingDetails.date).toLocaleDateString() : 'Not set'}
          - Wedding Type: ${weddingDetails.weddingType || 'Not specified'}
          - Budget Range: ${weddingDetails.budgetBucket || 'Not set'}
          - Guest Count Range: ${weddingDetails.guestCountBucket || 'Not set'}
          - Preferred Style: ${weddingDetails.preferredStyle || 'Not specified'}
          - Preferred Services: ${weddingDetails.preferredServices?.join(', ') || 'Not specified'}
          ${micrositeUrl ? `- Microsite URL: ${micrositeUrl}` : ''}

          Use these details to make the email more personal and relevant to the couple's wedding.
      `
      : '';

    const systemPrompt = generateEmailTemplatePrompt({
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      brandName,
      emailPurpose: dto.emailPurpose,
      audience: dto.audience,
      mainMessage: dto.mainMessage,
      micrositeUrl,
      locationMapUrl,
      eventLocation: location,
      tone,
      additionalContext: dto.additionalContext,
      weddingContext,
    });

    return this.getJsonCompletion<EmailTemplateResponse>(systemPrompt, {
      model: 'gpt-4o',
      temperature: 0.7,
    });
  }

  async generateMicrosite(
    dto: GenerateMicrositeDto,
    wedding: Wedding,
  ): Promise<Omit<CreateMicrositeDto, 'password' | 'weddingId'>> {
    // Build wedding context from wedding details
    const weddingContext = `
      - Wedding Date: ${wedding.date ? new Date(wedding.date).toLocaleDateString() : 'Not set'}
      - Location: ${wedding.location || 'Not specified'}
      - Wedding Type: ${wedding.weddingType || 'Not specified'}
      - Guest Count Range: ${wedding.guestCountBucket || 'Not set'}
      - Preferred Style: ${wedding.preferredStyle || 'Not specified'}
      - Preferred Services: ${wedding.preferredServices?.join(', ') || 'Not specified'}
    `;

    // Generate prompt
    const systemPrompt = generateMicrositePrompt({
      coupleName: dto.coupleName,
      weddingContext,
      additionalContext: dto.additionalContext,
      theme: dto.theme,
    });

    return this.getJsonCompletion<GeneratedMicrositeContent>(systemPrompt, {
      model: 'gpt-4o',
      temperature: 0.8,
    });
  }
}
