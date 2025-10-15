export interface EmailTemplatePromptParams {
  primaryColor?: string;
  secondaryColor?: string;
  brandName: string;
  emailPurpose: string;
  audience?: string;
  mainMessage?: string;
  micrositeUrl?: string;
  locationMapUrl?: string;
  eventLocation?: string;
  tone: string;
  additionalContext?: string;
  weddingContext: string;
}

export const generateEmailTemplatePrompt = (
  params: EmailTemplatePromptParams,
): string => {
  const {
    primaryColor = '#ff5a5f',
    secondaryColor = '#45292f',
    brandName,
    emailPurpose,
    audience,
    mainMessage,
    micrositeUrl,
    locationMapUrl,
    eventLocation,
    tone,
    additionalContext,
    weddingContext,
  } = params;

  return `You are an expert email template designer. Generate a professional HTML email template following these exact requirements:

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
  - .header (gradient background using primary and secondary colors)
  - .logo-img (150px width, 50px height)
  - .tagline (white text, 14px)
  - .content (padding: 40px 30px)
  - .greeting (24px, font-weight 600)
  - .message (16px, line-height 1.7)
  - .cta-button (gradient background using primary and secondary colors, rounded, uppercase)
  - .footer (gray background)
  - Mobile responsive styles (@media max-width: 600px)
  - Use primary color (${primaryColor}) and secondary color (${secondaryColor}) throughout the design

3. BRANDING:
  - Use brand name: ${brandName}
  - Logo URL: https://res.cloudinary.com/doudbsnya/image/upload/v1758432610/logo_ptrwb6.png
  - Primary color: ${primaryColor}
  - Secondary color: ${secondaryColor}
  - Use these colors in gradients and accent elements throughout the email
  - Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

4. CONTENT:
  - Email purpose: ${emailPurpose}
  ${audience ? `- Greeting audience: ${audience}` : '- Use a warm, inclusive greeting like "Dear Close Ones" or "Dear Family and Friends"'}
  ${mainMessage ? `- Main message: ${mainMessage}` : ''}
  ${eventLocation ? `- Event Location: ${eventLocation} (IMPORTANT: Use this location in the email content, not any location from the wedding context)` : ''}

  CALL-TO-ACTION BUTTONS (display in the same row):
  ${micrositeUrl ? `- First button: "View More" linking to: ${micrositeUrl}` : ''}
  ${locationMapUrl ? `- Second button: "View On Map" linking to: ${locationMapUrl}` : ''}
  ${!micrositeUrl && !locationMapUrl ? '- No call-to-action buttons available' : ''}
  ${micrositeUrl && locationMapUrl ? '- Display both buttons side by side in the same row with equal width and spacing' : ''}

  - Tone: ${tone}
  ${additionalContext ? `- Additional requirements: ${additionalContext}` : ''}

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
};
