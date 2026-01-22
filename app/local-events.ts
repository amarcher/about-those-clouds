// ============================================================================
// lib/local-events.ts - Fetch kid-friendly local events using Eventbrite API
// ============================================================================

export interface LocalEvent {
  name: string;
  date: string; // ISO date string
  venue: string;
  category: string;
  daysAway: number; // 0 for today, 1 for tomorrow, etc.
}

// Keywords that indicate kid-friendly community events
const KID_FRIENDLY_KEYWORDS = [
  'family',
  'kids',
  'children',
  'festival',
  'fair',
  'parade',
  'farmers market',
  'community',
  'library',
  'story time',
  'craft',
  'park',
  'outdoor',
  'celebration',
  'fireworks',
  'holiday',
  'easter',
  'halloween',
  'christmas',
  'arts and crafts',
  'puppet',
  'magic show',
  'zoo',
  'museum',
  'aquarium',
];

// Excluded keywords (adult-oriented events)
const EXCLUDED_KEYWORDS = [
  'casino',
  'adult',
  'nightclub',
  'bar crawl',
  'poker',
  '21+',
  '18+',
  'wine tasting',
  'brewery',
  'singles',
  'dating',
  'burlesque',
];

export async function getLocalEvents(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25
): Promise<LocalEvent | null> {
  const token = process.env.EVENTBRITE_TOKEN;

  // If no token, return null (graceful degradation)
  if (!token) {
    console.warn('EVENTBRITE_TOKEN not set, skipping events fetch');
    return null;
  }

  try {
    // Convert radius to kilometers for Eventbrite API
    const radiusKm = Math.round(radiusMiles * 1.60934);

    // Search for events in the next 14 days
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    // Eventbrite search endpoint
    const params = new URLSearchParams({
      'location.latitude': latitude.toFixed(4),
      'location.longitude': longitude.toFixed(4),
      'location.within': `${radiusKm}km`,
      'start_date.range_start': startDate,
      'start_date.range_end': endDate.toISOString(),
      expand: 'venue,category',
      'price': 'free', // Prioritize free community events
      'sort_by': 'date',
    });

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Eventbrite API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      return null;
    }

    // Filter to kid-friendly community events
    const kidFriendlyEvents = data.events.filter((event: any) => {
      const nameLower = event.name.text.toLowerCase();
      const descLower = (event.description?.text || '').toLowerCase();
      const combined = `${nameLower} ${descLower}`;

      // Exclude adult-oriented events
      if (EXCLUDED_KEYWORDS.some((keyword) => combined.includes(keyword))) {
        return false;
      }

      // Include if it matches kid-friendly keywords
      const isKidFriendly = KID_FRIENDLY_KEYWORDS.some((keyword) =>
        combined.includes(keyword)
      );

      // Also include events in kid-friendly categories
      const categoryName = event.category?.name?.toLowerCase() || '';
      const isKidFriendlyCategory =
        categoryName.includes('family') ||
        categoryName.includes('community') ||
        categoryName.includes('arts') ||
        categoryName.includes('festival');

      return isKidFriendly || isKidFriendlyCategory;
    });

    if (kidFriendlyEvents.length === 0) {
      return null;
    }

    // Get the first kid-friendly event
    const event = kidFriendlyEvents[0];

    // Calculate days away
    const eventDate = new Date(event.start.local);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAway = Math.floor(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      name: event.name.text,
      date: event.start.local,
      venue: event.venue?.name || 'a local venue',
      category: event.category?.name || 'community event',
      daysAway: Math.max(0, daysAway),
    };
  } catch (error) {
    console.error('Error fetching local events:', error);
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
