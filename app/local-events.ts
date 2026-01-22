// ============================================================================
// lib/local-events.ts - Find kid-friendly local events using AI-powered web search
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';

export interface LocalEvent {
  name: string;
  date: string; // Human-readable date
  venue: string;
  category: string;
  daysAway: number; // 0 for today, 1 for tomorrow, etc.
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getLocalEvents(
  city: string,
  region: string
): Promise<LocalEvent | null> {
  try {
    // Get current date info for search context
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const year = today.getFullYear();

    // Use Claude with search tools to find local events
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Find ONE upcoming kid-friendly or family event happening in ${city}, ${region} in the next 2 weeks (${month} ${year}).

Look for:
- Family festivals, fairs, parades
- Community celebrations (holiday events, town festivals)
- Farmers markets, outdoor concerts
- Library story times, children's museum events
- School or community sports events
- Arts & crafts fairs, outdoor movie nights

EXCLUDE:
- Adult-only events (bars, nightclubs, comedy shows)
- Ticketed concerts by major artists (focus on community events)
- Private events or fundraisers requiring registration

Return ONLY a JSON object with this exact format (no markdown, no explanation):
{
  "name": "Event name",
  "date": "Human-readable date (e.g., 'Saturday, January 25' or 'this Saturday')",
  "venue": "Location or venue name",
  "category": "Type of event (e.g., 'festival', 'parade', 'community event')",
  "daysAway": number of days from today (0 for today, 1 for tomorrow, etc.)
}

If you cannot find any suitable events, return: {"found": false}`,
        },
      ],
    });

    // Process the response
    let result = null;
    for (const block of message.content) {
      if (block.type === 'text') {
        try {
          const jsonMatch = block.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.found === false) {
              return null;
            }
            if (parsed.name && parsed.date) {
              result = parsed as LocalEvent;
            }
          }
        } catch (e) {
          console.error('Failed to parse event JSON:', e);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error finding local events:', error);
    return null;
  }
}

// Helper function to format event for story context
export function formatEventForStory(event: LocalEvent): {
  timing: 'today' | 'soon';
  description: string;
} {
  const timing = event.daysAway === 0 ? 'today' : 'soon';

  let timePhrase: string;
  if (event.daysAway === 0) {
    timePhrase = 'today';
  } else if (event.daysAway === 1) {
    timePhrase = 'tomorrow';
  } else if (event.daysAway <= 3) {
    timePhrase = 'in just a few days';
  } else if (event.daysAway <= 7) {
    timePhrase = 'next week';
  } else {
    timePhrase = 'soon';
  }

  const description = `${event.name} ${timePhrase} at ${event.venue}`;

  return { timing, description };
}
