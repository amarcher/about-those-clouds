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
  {
    city: 'San Diego',
    country: 'USA',
    lat: 32.7157,
    lon: -117.1611,
    event: 'watching playful dolphins jump through the waves at the beach',
    season: 'year-round',
  },
  {
    city: 'Orlando',
    country: 'USA',
    lat: 28.5383,
    lon: -81.3792,
    event: 'watching colorful fireworks light up the night sky',
    season: 'year-round',
  },
  {
    city: 'Seattle',
    country: 'USA',
    lat: 47.6062,
    lon: -122.3321,
    event: 'watching fishmongers toss big fish through the air at the market',
    season: 'year-round',
  },
  {
    city: 'Chicago',
    country: 'USA',
    lat: 41.8781,
    lon: -87.6298,
    event: 'watching sailboats glide across the sparkling blue lake',
    season: 'year-round',
  },
  {
    city: 'Boston',
    country: 'USA',
    lat: 42.3601,
    lon: -71.0589,
    event: 'watching ducklings waddle behind their mama through the park',
    season: 'year-round',
  },
  {
    city: 'New Orleans',
    country: 'USA',
    lat: 29.9511,
    lon: -90.0715,
    event: 'watching musicians play cheerful jazz music on street corners',
    season: 'year-round',
  },
  {
    city: 'Portland',
    country: 'USA',
    lat: 45.5152,
    lon: -122.6784,
    event: 'watching food trucks serve yummy treats from around the world',
    season: 'year-round',
  },
  {
    city: 'Austin',
    country: 'USA',
    lat: 30.2672,
    lon: -97.7431,
    event: 'watching thousands of bats fly out from under the bridge at sunset',
    season: 'year-round',
  },
  {
    city: 'Denver',
    country: 'USA',
    lat: 39.7392,
    lon: -104.9903,
    event: 'watching the beautiful Rocky Mountains turn pink at sunrise',
    season: 'year-round',
  },
  {
    city: 'Honolulu',
    country: 'USA',
    lat: 21.3099,
    lon: -157.8581,
    event: 'watching hula dancers tell stories with their graceful movements',
    season: 'year-round',
  },
  {
    city: 'Philadelphia',
    country: 'USA',
    lat: 39.9526,
    lon: -75.1652,
    event: 'watching kids run up the famous Rocky steps at the art museum',
    season: 'year-round',
  },
  {
    city: 'Las Vegas',
    country: 'USA',
    lat: 36.1699,
    lon: -115.1398,
    event: 'watching the dancing fountains shoot water high into the air',
    season: 'year-round',
  },
  {
    city: 'Charleston',
    country: 'USA',
    lat: 32.7765,
    lon: -79.9311,
    event: 'watching horse-drawn carriages clip-clop through historic streets',
    season: 'spring',
  },
  {
    city: 'Savannah',
    country: 'USA',
    lat: 32.0809,
    lon: -81.0912,
    event: 'watching azaleas bloom in every color of the rainbow',
    season: 'spring',
  },
  {
    city: 'Nashville',
    country: 'USA',
    lat: 36.1627,
    lon: -86.7816,
    event: 'watching musicians strum guitars and sing songs on every corner',
    season: 'spring',
  },
  {
    city: 'Portland',
    country: 'USA',
    lat: 43.6591,
    lon: -70.2568,
    event: 'watching lobster boats bring in their catch at the harbor',
    season: 'spring',
  },
  {
    city: 'Williamsburg',
    country: 'USA',
    lat: 37.2707,
    lon: -76.7075,
    event: 'watching people dress up in colonial costumes from long ago',
    season: 'spring',
  },
  {
    city: 'Tulsa',
    country: 'USA',
    lat: 36.1540,
    lon: -95.9928,
    event: 'watching wildflowers paint the prairies with bright colors',
    season: 'spring',
  },
  {
    city: 'Santa Fe',
    country: 'USA',
    lat: 35.6870,
    lon: -105.9378,
    event: 'watching artists create beautiful pottery and paintings',
    season: 'summer',
  },
  {
    city: 'Minneapolis',
    country: 'USA',
    lat: 44.9778,
    lon: -93.2650,
    event: 'watching families bike and swim at sparkling blue lakes',
    season: 'summer',
  },
  {
    city: 'Miami',
    country: 'USA',
    lat: 25.7617,
    lon: -80.1918,
    event: 'watching colorful kites dance in the ocean breeze',
    season: 'summer',
  },
  {
    city: 'Anchorage',
    country: 'USA',
    lat: 61.2181,
    lon: -149.9003,
    event: 'watching salmon jump up waterfalls on their way home',
    season: 'summer',
  },
  {
    city: 'San Antonio',
    country: 'USA',
    lat: 29.4241,
    lon: -98.4936,
    event: 'watching boats cruise down the colorful River Walk',
    season: 'summer',
  },
  {
    city: 'Yellowstone',
    country: 'USA',
    lat: 44.4280,
    lon: -110.5885,
    event: 'watching Old Faithful geyser shoot water way up in the sky',
    season: 'summer',
  },
  {
    city: 'Mackinac Island',
    country: 'USA',
    lat: 45.8492,
    lon: -84.6195,
    event: 'watching horse-drawn carriages and families making fudge',
    season: 'summer',
  },
  {
    city: 'Aspen',
    country: 'USA',
    lat: 39.1911,
    lon: -106.8175,
    event: 'watching golden aspen leaves shimmer and shake in the breeze',
    season: 'fall',
  },
  {
    city: 'Cape Cod',
    country: 'USA',
    lat: 41.6688,
    lon: -70.2962,
    event: 'watching cranberries float in the bogs during harvest time',
    season: 'fall',
  },
  {
    city: 'Napa Valley',
    country: 'USA',
    lat: 38.2975,
    lon: -122.2869,
    event: 'watching hot air balloons float over vineyards at sunrise',
    season: 'fall',
  },
  {
    city: 'Salem',
    country: 'USA',
    lat: 42.5195,
    lon: -70.8967,
    event: 'watching families carve pumpkins and celebrate autumn',
    season: 'fall',
  },
  {
    city: 'Asheville',
    country: 'USA',
    lat: 35.5951,
    lon: -82.5515,
    event: 'watching the Blue Ridge Mountains turn orange, red, and gold',
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

// Simple seeded random number generator (deterministic)
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const x = Math.sin(Math.abs(hash)) * 10000;
  return x - Math.floor(x);
}

export function getRandomMiloLocation(seed?: string): CityEvent {
  const currentSeason = getCurrentSeason();

  // Filter cities relevant to current season or year-round
  const relevantCities = HAPPY_CITIES.filter(
    (city) => city.season === currentSeason || city.season === 'year-round'
  );

  // Pick a city from the filtered list
  // If seed is provided, use deterministic selection; otherwise use true random
  const randomValue = seed ? seededRandom(seed) : Math.random();
  const randomIndex = Math.floor(randomValue * relevantCities.length);
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
