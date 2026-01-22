// ============================================================================
// lib/local-events.ts - Fetch kid-friendly local events using Ticketmaster API
// ============================================================================

export interface LocalEvent {
  name: string;
  date: string; // ISO date string
  venue: string;
  category: string;
  daysAway: number; // 0 for today, 1 for tomorrow, etc.
}

// Excluded keywords (adult-oriented events)
const EXCLUDED_KEYWORDS = [
  'casino',
  'adult only',
  'nightclub',
  'bar crawl',
  'poker',
  '21+',
  '18+',
  'wine tasting',
  'brewery tour',
  'singles',
  'dating',
  'burlesque',
  'comedy',
  'standup',
];

export async function getLocalEvents(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25
): Promise<LocalEvent | null> {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  // If no API key, return null (graceful degradation)
  if (!apiKey) {
    console.warn('TICKETMASTER_API_KEY not set, skipping events fetch');
    return null;
  }

  try {
    // Search for events in the next 14 days
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    // Ticketmaster Discovery API endpoint
    const params = new URLSearchParams({
      apikey: apiKey,
      latlong: `${latitude.toFixed(4)},${longitude.toFixed(4)}`,
      radius: radiusMiles.toString(),
      unit: 'miles',
      startDateTime: startDate,
      endDateTime: endDate.toISOString(),
      size: '50', // Get more events to filter through
      sort: 'date,asc', // Soonest first
      classificationName: 'Family,Festival,Arts & Theatre', // Kid-friendly categories
    });

    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
    );

    if (!response.ok) {
      console.error('Ticketmaster API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data._embedded?.events || data._embedded.events.length === 0) {
      return null;
    }

    // Filter to kid-friendly events
    const kidFriendlyEvents = data._embedded.events.filter((event: any) => {
      const nameLower = event.name.toLowerCase();
      const infoLower = (event.info || '').toLowerCase();
      const combined = `${nameLower} ${infoLower}`;

      // Exclude adult-oriented events
      if (EXCLUDED_KEYWORDS.some((keyword) => combined.includes(keyword))) {
        return false;
      }

      return true;
    });

    if (kidFriendlyEvents.length === 0) {
      return null;
    }

    // Get the first kid-friendly event
    const event = kidFriendlyEvents[0];

    // Calculate days away
    const eventDate = new Date(
      event.dates.start.dateTime || event.dates.start.localDate
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAway = Math.floor(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      name: event.name,
      date: event.dates.start.localDate,
      venue: event._embedded?.venues?.[0]?.name || 'a local venue',
      category:
        event.classifications?.[0]?.segment?.name || 'community event',
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
