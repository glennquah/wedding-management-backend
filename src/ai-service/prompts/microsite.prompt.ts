export interface MicrositePromptParams {
  coupleName: string;
  weddingContext: string;
  additionalContext?: string;
  theme?: string;
}

export const generateMicrositePrompt = (
  params: MicrositePromptParams,
): string => {
  const { coupleName, weddingContext, additionalContext, theme } = params;

  return `You are an expert wedding website content generator. Generate content for a beautiful wedding microsite following these requirements:

CONTEXT:
- Couple Name: ${coupleName}
${weddingContext}
${theme ? `- Preferred Theme/Style: ${theme}` : ''}
${additionalContext ? `- Additional Requirements: ${additionalContext}` : ''}

REQUIREMENTS:

1. SLUG GENERATION:
   - Create a unique, SEO-friendly URL slug based on the couple's names
   - Format: lowercase, hyphen-separated, no special characters
   - Example: "john-and-jane" or "sarah-david-wedding"

2. HERO IMAGES (heroImages):
   - Provide 3-5 wedding-themed image URLs using Unsplash's source API
   - IMPORTANT: Use ONLY the following format to ensure valid URLs:
     * Format: "https://source.unsplash.com/1600x900/?wedding,ceremony"
     * Or: "https://source.unsplash.com/1600x900/?wedding,venue"
     * Or: "https://source.unsplash.com/1600x900/?wedding,couple"
     * Or: "https://source.unsplash.com/1600x900/?wedding,romantic"
   - This format automatically fetches random high-quality images from Unsplash
   - Vary the search terms (wedding,ceremony / wedding,venue / wedding,couple / wedding,romantic / wedding,celebration)
   - Format: array of 3-5 URLs

3. IMAGE GALLERY (imageGallery):
   - Provide 8-12 wedding-themed image URLs using Unsplash's source API
   - IMPORTANT: Use ONLY the following format to ensure valid URLs:
     * Format: "https://source.unsplash.com/800x600/?wedding,{keyword}"
     * Replace {keyword} with: flowers, decoration, venue, couple, celebration, cake, rings, bouquet, reception, ceremony
   - This format automatically fetches random high-quality images from Unsplash
   - Use diverse keywords to get variety: flowers, decoration, venue, couple, celebration, cake, rings, bouquet, reception, ceremony, dancing, toast
   - Format: array of 8-12 URLs with different keywords

4. WEDDING SCHEDULE (schedule):
   - Create a realistic 6-8 event timeline for the wedding day
   - Each event must have: time (e.g., "2:00 PM"), title, and description
   - Start with guest arrival/registration and end with reception/farewell
   - Make it elegant and personalized to the wedding details provided
   - Format: array of objects with { time: string, title: string, description: string }

5. FAQS (faqs):
   - Generate 8-10 frequently asked questions and answers
   - Cover topics like: dress code, parking, gifts, accommodation, RSVP, food/dietary, plus-ones, photography, children
   - Make answers warm, helpful, and specific to the wedding context
   - Format: array of objects with { q: string, a: string }

6. TEMPLATE NUMBER (templateNumber):
   - Based on the wedding style/theme, suggest a template number (1-3)
   - Template 1: Classic/Traditional
   - Template 2: Modern/Minimalist
   - Template 3: Romantic/Elegant

IMPORTANT:
- Use the wedding context to personalize all content
- Keep tone warm, romantic, and welcoming
- Ensure all text is grammatically perfect
- Make the schedule realistic and flow naturally
- FAQs should anticipate real guest concerns
- CRITICAL: For images, ONLY use the Unsplash source API format specified above (https://source.unsplash.com/...)
- DO NOT create fake photo IDs or make up image URLs - use only the source API format with keywords
- The source API format ensures all images will be valid, high-quality, and automatically fetched from Unsplash

Return JSON format exactly matching this TypeScript interface:
{
  "templateNumber": number (1-3),
  "slug": "couple-names-slug",
  "coupleName": "formatted couple name",
  "heroImages": [
    "https://source.unsplash.com/1600x900/?wedding,ceremony",
    "https://source.unsplash.com/1600x900/?wedding,venue",
    "https://source.unsplash.com/1600x900/?wedding,couple"
  ],
  "imageGallery": [
    "https://source.unsplash.com/800x600/?wedding,flowers",
    "https://source.unsplash.com/800x600/?wedding,decoration",
    "https://source.unsplash.com/800x600/?wedding,venue",
    "https://source.unsplash.com/800x600/?wedding,couple",
    "https://source.unsplash.com/800x600/?wedding,celebration",
    "https://source.unsplash.com/800x600/?wedding,cake",
    "https://source.unsplash.com/800x600/?wedding,rings",
    "https://source.unsplash.com/800x600/?wedding,bouquet"
  ],
  "schedule": [
    {
      "time": "2:00 PM",
      "title": "Event Title",
      "description": "Event description"
    }
  ],
  "faqs": [
    {
      "q": "Question here?",
      "a": "Answer here."
    }
  ]
}`;
};
