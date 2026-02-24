// ============================================================================
// lib/local-events.ts - Suggest kid-friendly activities based on weather/time
// ============================================================================

import type { WeatherData } from "./types";

export interface SuggestedActivity {
  activity: string; // e.g., "splashing in a sprinkler at the park"
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type Season = "spring" | "summer" | "fall" | "winter";

const PRECIPITATION_ACTIVITIES: Record<string, string[]> = {
  Snow: [
    "building a snowman",
    "making snow angels",
    "catching snowflakes on their tongues",
  ],
  Thunderstorm: [
    "watching the lightning from the window",
    "counting seconds between thunder and lightning",
  ],
  Rain: ["jumping in puddles with rain boots", "listening to rain on the roof"],
  Drizzle: [
    "jumping in puddles with rain boots",
    "listening to rain on the roof",
  ],
};

const NIGHT_ACTIVITIES = [
  "snuggled up with a bedtime story",
  "looking at the stars",
];

const SEASON_ACTIVITIES: Record<
  Season,
  {
    condition: (temp: number, timeOfDay: TimeOfDay) => boolean;
    activities: string[];
  }[]
> = {
  summer: [
    {
      condition: (temp) => temp > 80,
      activities: [
        "splashing in a sprinkler at the park",
        "swimming at the pool",
        "eating popsicles on the front porch",
      ],
    },
    {
      condition: (_temp, timeOfDay) => timeOfDay === "evening",
      activities: ["catching fireflies in the backyard"],
    },
  ],
  spring: [
    {
      condition: () => true,
      activities: [
        "flying kites in the breeze",
        "planting flowers in the garden",
        "riding bikes around the neighborhood",
      ],
    },
  ],
  fall: [
    {
      condition: () => true,
      activities: [
        "jumping in leaf piles",
        "picking apples at an orchard",
        "going on a hayride",
      ],
    },
  ],
  winter: [
    {
      condition: (temp) => temp < 40,
      activities: [
        "making hot cocoa",
        "building a blanket fort",
        "ice skating at the rink",
      ],
    },
  ],
};

const MILD_ACTIVITIES = [
  "riding bikes around the neighborhood",
  "playing at the playground",
  "walking the dog around the block",
];

const WARM_ACTIVITIES = ["eating ice cream", "playing at the park"];

function getLocalHour(weatherData: WeatherData): number {
  const nowUtcMs = Date.now();
  const localMs = nowUtcMs + weatherData.timezone * 1000;
  const localDate = new Date(localMs);
  return localDate.getUTCHours();
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 17) return "afternoon";
  if (hour >= 18 && hour <= 20) return "evening";
  return "night";
}

function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

/**
 * Simple hash to deterministically pick from an array.
 * Uses date + temp + hour so same conditions = same pick.
 */
function deterministicPick(items: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length];
}

export function suggestActivity(weatherData: WeatherData): SuggestedActivity {
  const hour = getLocalHour(weatherData);
  const timeOfDay = getTimeOfDay(hour);
  const temp = Math.round(weatherData.main.temp);
  const weatherMain = weatherData.weather[0]?.main ?? "Clear";
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const season = getSeason(month);

  // Seed for deterministic picks: date + temp + hour
  const seed = `${now.toISOString().slice(0, 10)}-${temp}-${hour}`;

  // 1. Precipitation overrides
  const precipActivities = PRECIPITATION_ACTIVITIES[weatherMain];
  if (precipActivities) {
    return { activity: deterministicPick(precipActivities, seed) };
  }

  // 2. Night
  if (timeOfDay === "night") {
    return { activity: deterministicPick(NIGHT_ACTIVITIES, seed) };
  }

  // 3. Season + temp + time of day
  const seasonEntries = SEASON_ACTIVITIES[season];
  for (const entry of seasonEntries) {
    if (entry.condition(temp, timeOfDay)) {
      return { activity: deterministicPick(entry.activities, seed) };
    }
  }

  // 4. Generic fallbacks based on temp
  if (temp >= 50 && temp <= 75) {
    return { activity: deterministicPick(MILD_ACTIVITIES, seed) };
  }
  if (temp > 75 && temp <= 90) {
    return { activity: deterministicPick(WARM_ACTIVITIES, seed) };
  }

  // Ultimate fallback
  return { activity: deterministicPick(MILD_ACTIVITIES, seed) };
}
