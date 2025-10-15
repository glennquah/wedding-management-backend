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
   - Provide exactly 3 wedding-themed image URLs
   - IMPORTANT: Choose ONLY from this list of verified Unsplash wedding photos:
     * "https://images.unsplash.com/photo-1519741497674-611481863552" (Outdoor wedding ceremony)
     * "https://images.unsplash.com/photo-1606800052052-a08af7148866" (Wedding venue setup)
     * "https://images.unsplash.com/photo-1511285560929-80b456fea0bc" (Romantic couple)
     * "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6" (Wedding altar)
     * "https://images.unsplash.com/photo-1583939003579-730e3918a45a" (Beach wedding)
     * "https://images.unsplash.com/photo-1520854221256-17451cc331bf" (Wedding reception)
   - Select 3 different URLs from the list above
   - These are real, verified Unsplash photo URLs that will always work

3. IMAGE GALLERY (imageGallery):
   - Provide exactly 8-10 wedding-themed image URLs
   - IMPORTANT: Choose ONLY from this list of verified Unsplash wedding photos:
     * "https://images.unsplash.com/photo-1511285560929-80b456fea0bc" (Wedding bouquet)
     * "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3" (Wedding decoration)
     * "https://images.unsplash.com/photo-1519225421980-715cb0215aed" (Wedding venue interior)
     * "https://images.unsplash.com/photo-1522673607200-164d1b6ce486" (Couple celebrating)
     * "https://images.unsplash.com/photo-1511795409834-ef04bbd61622" (Wedding celebration)
     * "https://images.unsplash.com/photo-1535254973040-607b474cb50d" (Wedding cake)
     * "https://images.unsplash.com/photo-1606216794074-735e91aa2c92" (Wedding rings)
     * "https://images.unsplash.com/photo-1478146896981-b80fe463b330" (Flowers bouquet)
     * "https://images.unsplash.com/photo-1519741497674-611481863552" (Wedding reception scene)
     * "https://images.unsplash.com/photo-1520854221256-17451cc331bf" (Wedding dinner)
     * "https://images.unsplash.com/photo-1469371670807-013ccf25f16a" (Dancing at wedding)
     * "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8" (Toast/champagne)
   - Select 8-10 different URLs from the list above
   - Use a good variety to showcase different aspects of the wedding
   - These are real, verified Unsplash photo URLs that will always work

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
- CRITICAL: For images, ONLY select from the verified Unsplash URLs provided in the lists above
- DO NOT create new URLs or modify the URLs - copy them exactly as provided
- DO NOT use the old source.unsplash.com format - only use images.unsplash.com URLs from the lists
- These are real, tested, accessible Unsplash photos that will always work

Return JSON format exactly matching this TypeScript interface:
{
  "templateNumber": number (1-3),
  "slug": "couple-names-slug",
  "coupleName": "formatted couple name",
  "heroImages": [
    "https://images.unsplash.com/photo-1519741497674-611481863552",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc"
  ],
  "imageGallery": [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
    "https://images.unsplash.com/photo-1535254973040-607b474cb50d",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330"
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
