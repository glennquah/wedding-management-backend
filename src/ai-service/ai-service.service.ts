import { Injectable } from '@nestjs/common';
import { Wedding } from '@prisma/client';
import OpenAI from 'openai';
import { GenerateAiEmailTemplateDto } from '../email-notification/dto/generate-ai-email-template.dto';
import { EmailTemplateResponse } from './interfaces/email-template-response.interface';

@Injectable()
export class AiServiceService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getEmailTemplate(prompt: string): Promise<EmailTemplateResponse> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
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
    weddingDetails?: Wedding,
  ): Promise<EmailTemplateResponse> {
    const brandName = dto.brandName || 'Knotly';
    const tone = dto.tone || 'friendly';

    // Extract wedding information if available
    const weddingContext = weddingDetails
      ? `
WEDDING CONTEXT (use this to personalize the email):
   - Wedding Name: ${weddingDetails.name || 'N/A'}
   - Wedding Date: ${weddingDetails.date ? new Date(weddingDetails.date).toLocaleDateString() : 'Not set'}
   - Venue: ${weddingDetails.venue || 'Not specified'}
   - Budget: ${weddingDetails.budget ? `$${weddingDetails.budget}` : 'Not set'}
   - Guest Count: ${weddingDetails.guestCount || 'Not set'}
   - Theme/Style: ${weddingDetails.theme || 'Not specified'}

   Use these details to make the email more personal and relevant to the couple's wedding.
`
      : '';

    const systemPrompt = `You are an expert email template designer. Generate a professional HTML email template following these exact requirements:

STRUCTURE:
1. Must follow this exact HTML structure similar to existing Knotly email templates:
   - DOCTYPE and HTML tags with responsive meta tags
   - Embedded CSS styles in <style> tag
   - Main container with max-width 600px
   - Header section with gradient background
   - Content section with proper padding
   - Footer section with branding

2. REQUIRED CSS CLASSES (must include):
   - .email-container (max-width: 600px, centered)
   - .header (gradient background: linear-gradient(135deg, #ff5a5f 0%, #45292f 100%))
   - .logo-img (150px width, 50px height)
   - .tagline (white text, 14px)
   - .content (padding: 40px 30px)
   - .greeting (24px, font-weight 600)
   - .message (16px, line-height 1.7)
   - .cta-button (gradient background, rounded, uppercase)
   - .footer (gray background)
   - Mobile responsive styles (@media max-width: 600px)

3. BRANDING:
   - Use brand name: ${brandName}
   - Logo URL: https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png
   - Primary color: #ff5a5f (gradient with #45292f)
   - Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

4. CONTENT:
   - Email purpose: ${dto.emailPurpose}
   ${dto.recipientName ? `- Recipient name placeholder: {{name}} or {{userName}}` : ''}
   ${dto.mainMessage ? `- Main message: ${dto.mainMessage}` : ''}
   ${dto.buttonText && dto.buttonUrl ? `- CTA button text: "${dto.buttonText}" with URL placeholder: {{buttonUrl}}` : ''}
   ${dto.colorScheme ? `- Incorporate color scheme: ${dto.colorScheme} (while keeping Knotly brand identity)` : ''}
   - Tone: ${tone}
   ${dto.additionalContext ? `- Additional requirements: ${dto.additionalContext}` : ''}

${weddingContext}

5. IMPORTANT:
   - Use handlebars syntax {{variableName}} for dynamic content
   - Include proper alt text for images
   - Ensure mobile responsiveness
   - Use inline-important styles for email client compatibility (!important for colors and critical styles)
   - Include footer with social links, website link, and contact information
   - If wedding details are provided, incorporate them naturally into the email content

Return JSON format:
{
  "subject": "engaging subject line for the email",
  "html": "complete HTML template as a string"
}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;

    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      throw new Error('OpenAI did not return valid JSON');
    }
  }
}
