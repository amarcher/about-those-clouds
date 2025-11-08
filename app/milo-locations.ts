// ============================================================================
// lib/milo-locations.ts - Curated cities with happy events for Milo's adventures
// ============================================================================

export interface CityEvent {
  city: string;
  country: string;
  lat: number;
  lon: number;
  event: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
}

// Curated list of cities with happy, kid-friendly landmarks and events
export const HAPPY_CITIES: CityEvent[] = [
  // Year-round
  {
    city: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    event: 'watching artists paint beautiful pictures by the Eiffel Tower',
    season: 'year-round',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    event: 'watching children feed friendly deer in the peaceful parks',
    season: 'year-round',
  },
  {
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    event: 'watching surfers ride big waves at Bondi Beach',
    season: 'year-round',
  },
  {
    city: 'London',
    country: 'England',
    lat: 51.5074,
    lon: -0.1278,
    event: 'watching the Changing of the Guard at Buckingham Palace',
    season: 'year-round',
  },
  {
    city: 'New York City',
    country: 'USA',
    lat: 40.7128,
    lon: -74.006,
    event: 'watching street performers juggle in Central Park',
    season: 'year-round',
  },
  {
    city: 'Rio de Janeiro',
    country: 'Brazil',
    lat: -22.9068,
    lon: -43.1729,
    event: 'watching people play beach volleyball on Copacabana Beach',
    season: 'year-round',
  },
  {
    city: 'Copenhagen',
    country: 'Denmark',
    lat: 55.6761,
    lon: 12.5683,
    event: 'watching kids ride bikes through colorful neighborhoods',
    season: 'year-round',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    event: 'watching the amazing light show at Gardens by the Bay',
    season: 'year-round',
  },
  {
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.3851,
    lon: 2.1734,
    event: 'watching people build amazing sandcastles on the beach',
    season: 'year-round',
  },
  {
    city: 'Vancouver',
    country: 'Canada',
    lat: 49.2827,
    lon: -123.1207,
    event: 'watching orcas swim in the beautiful ocean',
    season: 'year-round',
  },

  // Spring events
  {
    city: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3676,
    lon: 4.9041,
    event: 'watching millions of colorful tulips bloom in the flower fields',
    season: 'spring',
  },
  {
    city: 'Washington DC',
    country: 'USA',
    lat: 38.9072,
    lon: -77.0369,
    event: 'watching the beautiful cherry blossoms bloom around the monuments',
    season: 'spring',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    lat: 35.0116,
    lon: 135.7681,
    event: 'watching families have picnics under pink cherry blossom trees',
    season: 'spring',
  },

  // Summer events
  {
    city: 'Stockholm',
    country: 'Sweden',
    lat: 59.3293,
    lon: 18.0686,
    event: 'watching people celebrate the bright midnight sun',
    season: 'summer',
  },
  {
    city: 'San Francisco',
    country: 'USA',
    lat: 37.7749,
    lon: -122.4194,
    event: 'watching sea lions play on the docks at Fisherman\'s Wharf',
    season: 'summer',
  },

  // Fall events
  {
    city: 'Munich',
    country: 'Germany',
    lat: 48.1351,
    lon: 11.582,
    event: 'watching the autumn festival with colorful decorations',
    season: 'fall',
  },
  {
    city: 'Vermont',
    country: 'USA',
    lat: 44.2601,
    lon: -72.5754,
    event: 'watching the leaves turn brilliant red, orange, and yellow',
    season: 'fall',
  },

  // Winter events
  {
    city: 'Reykjavik',
    country: 'Iceland',
    lat: 64.1466,
    lon: -21.9426,
    event: 'watching the magical Northern Lights dance in the sky',
    season: 'winter',
  },
  {
    city: 'Quebec City',
    country: 'Canada',
    lat: 46.8139,
    lon: -71.208,
    event: 'watching families build amazing ice sculptures at the Winter Carnival',
    season: 'winter',
  },
];

export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
}

export function getRandomMiloLocation(): CityEvent {
  const currentSeason = getCurrentSeason();

  // Filter cities relevant to current season or year-round
  const relevantCities = HAPPY_CITIES.filter(
    (city) => city.season === currentSeason || city.season === 'year-round'
  );

  // Pick a random city from the filtered list
  const randomIndex = Math.floor(Math.random() * relevantCities.length);
  return relevantCities[randomIndex];
}

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
