import Anthropic from '@anthropic-ai/sdk';
import type { CloudInfo, WeatherData, Child } from './types';
import { isMiloPresent } from './cloud-identification';
import {
  getRandomMiloLocation,
  calculateDistance,
  type CityEvent,
} from './milo-locations';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCloudStory(
  cloudInfo: CloudInfo,
  weatherData: WeatherData,
  location: { city: string; region: string; lat: number; lon: number },
  children?: Child[]
): Promise<string> {
  const temp = Math.round(weatherData.main.temp);
  const windSpeed = Math.round(weatherData.wind.speed);

  // Build personalization context
  let personalization = '';
  if (children && children.length > 0) {
    const childrenDescriptions = children
      .map((child) => {
        const pronounObj =
          child.pronouns === 'he/him'
            ? 'he/him/his'
            : child.pronouns === 'she/her'
              ? 'she/her/hers'
              : 'they/them/their';
        return `${child.name} (age ${child.age}, pronouns: ${pronounObj})`;
      })
      .join(', ');

    personalization = `\n\nPERSONALIZATION: You are speaking directly to: ${childrenDescriptions}.
Address them by name warmly and use their correct pronouns. Make it feel like you're sharing this adventure specifically with them!`;
  }

  const miloPresent = isMiloPresent(cloudInfo);
  const adventureCity = getRandomMiloLocation();

  if (miloPresent) {
    return generateMiloFoundStory(
      cloudInfo,
      location,
      adventureCity,
      temp,
      windSpeed,
      personalization
    );
  } else {
    const distance = calculateDistance(
      location.lat,
      location.lon,
      adventureCity.lat,
      adventureCity.lon
    );
    return generateMiloAwayStory(
      cloudInfo,
      location,
      adventureCity,
      distance,
      temp,
      windSpeed,
      personalization
    );
  }
}

async function generateMiloFoundStory(
  cloudInfo: CloudInfo,
  location: { city: string; region: string },
  adventureCity: CityEvent,
  temp: number,
  windSpeed: number,
  personalization: string
): Promise<string> {
  const prompt = `You are an enthusiastic storyteller sharing exciting news with children about Milo the Cloud!${personalization}

MILO THE CLOUD CHARACTER:
- Milo is a fluffy, friendly cumulus cloud (like a cotton ball)
- Milo loves to travel around the world and watch happy things happen
- Milo has a curious, adventurous personality and brings joy wherever they float

CURRENT SITUATION - MILO IS HERE! 🎉
- Location: ${location.city}, ${location.region}
- Cloud type overhead: ${cloudInfo.scientificName} (${cloudInfo.kidFriendlyName})
- Temperature: ${temp}°F, Wind: ${windSpeed} mph
- Milo just traveled from: ${adventureCity.city}, ${adventureCity.country}
- What Milo watched there: ${adventureCity.event}

YOUR TASK:
Create a 60-90 second audio story that:

1. **Exciting Discovery** (10-15 sec): Start with excitement - "Great news! Milo the cloud is floating right above ${location.city} today!"

2. **Where Milo Came From** (25-35 sec): Tell a warm, vivid story about Milo's recent adventure in ${adventureCity.city}, ${adventureCity.country}. Describe what Milo watched: "${adventureCity.event}". Make it visual and magical - what did Milo see from up in the sky? What sounds, colors, and happy feelings did Milo experience?

3. **Why Milo Came Here** (15-20 sec): Explain that Milo floated all this way because they wanted to visit ${location.city}! Maybe Milo heard something wonderful about this place, or is excited to see what's happening here today.

4. **Invitation** (10-15 sec): Encourage the listener to go outside and look up - wave at Milo! Milo can see them from up there and is so happy to be visiting.

TONE: Joyful, magical, wonder-filled. Use simple words (ages 5-10). Make kids feel special that Milo chose to visit their town. Paint vivid pictures with words.

FORMAT: Write ONLY the spoken script. No labels, no stage directions. Just the story as you'd tell it excitedly to a child.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // 5-10x faster than Sonnet, still high quality
    max_tokens: 512, // Stories are ~300-400 tokens, save costs
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

async function generateMiloAwayStory(
  cloudInfo: CloudInfo,
  location: { city: string; region: string },
  adventureCity: CityEvent,
  distance: number,
  temp: number,
  windSpeed: number,
  personalization: string
): Promise<string> {
  // Estimate return time based on wind speed (cloud travel speed)
  const avgCloudSpeed = 20; // mph average
  const currentSpeed = windSpeed || avgCloudSpeed;
  const daysToReturn = Math.ceil(distance / (currentSpeed * 24));
  const returnEstimate =
    daysToReturn === 0
      ? 'maybe even later today'
      : daysToReturn === 1
        ? 'in about a day'
        : `in about ${daysToReturn} days`;

  const prompt = `You are an enthusiastic storyteller sharing news with children about where Milo the Cloud is today!${personalization}

MILO THE CLOUD CHARACTER:
- Milo is a fluffy, friendly cumulus cloud (like a cotton ball)
- Milo loves to travel around the world and watch happy things happen
- Milo has a curious, adventurous personality and brings joy wherever they float

CURRENT SITUATION - MILO IS SOMEWHERE ELSE 🔍
- Listener's location: ${location.city}, ${location.region}
- Current sky: ${cloudInfo.scientificName} (${cloudInfo.kidFriendlyName}) - NOT Milo today
- Milo's location: ${adventureCity.city}, ${adventureCity.country}
- Distance away: ${distance.toLocaleString()} miles
- What Milo is watching: ${adventureCity.event}
- Temperature here: ${temp}°F, Wind: ${windSpeed} mph
- When Milo might return: ${returnEstimate}

YOUR TASK:
Create a 60-90 second audio story that:

1. **Gentle Opening** (10-15 sec): "Today, Milo the cloud isn't floating over ${location.city}... but I know exactly where they are!"

2. **Milo's Current Adventure** (35-45 sec): Paint a vivid, exciting picture of Milo's current location in ${adventureCity.city}, ${adventureCity.country}. Describe what Milo is watching: "${adventureCity.event}". Make it magical - what does Milo see from the sky? What happy things are happening? Use sensory details (colors, sounds, feelings).

3. **The Distance** (10-15 sec): Explain that Milo is ${distance.toLocaleString()} miles away - put this in kid-friendly terms (like "that's about [X big thing]" if distance is huge).

4. **When Milo Returns** (15-20 sec): Based on the wind and weather, Milo might drift back to ${location.city} ${returnEstimate}! Encourage them to check back - maybe Milo will be floating overhead next time they look up!

TONE: Warm, optimistic, adventurous. Make distance feel exciting (not sad). Kids should feel like they're tracking a friend on an adventure!

FORMAT: Write ONLY the spoken script. No labels, no stage directions. Just the story told warmly to a child.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // 5-10x faster than Sonnet, still high quality
    max_tokens: 512, // Stories are ~300-400 tokens, save costs
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}
