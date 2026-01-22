import Anthropic from '@anthropic-ai/sdk';
import type { CloudInfo, WeatherData, Child } from './types';
import { isMiloPresent } from './cloud-identification';
import {
  getRandomMiloLocation,
  type CityEvent,
} from './milo-locations';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


export async function generateCloudStory(
  cloudInfo: CloudInfo,
  weatherData: WeatherData,
  location: { city: string; region: string; lat: number; lon: number },
  children?: Child[],
  locationSeed?: string
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
  // Use seed to make Milo's location deterministic for cache consistency
  const adventureCity = getRandomMiloLocation(locationSeed);

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
    return generateMiloAwayStory(
      cloudInfo,
      location,
      adventureCity,
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
  const today = new Date();
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const year = today.getFullYear();

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

STEP 1: First, quickly search the web for ONE upcoming kid-friendly event in ${location.city}, ${location.region} in the next 2 weeks (${month} ${year}). Look for family festivals, fairs, parades, farmers markets, library events, or community celebrations. Exclude adult-only events. If you find one, note the event name and when it's happening (today or upcoming). If you don't find anything suitable, that's okay - skip to Step 2.

STEP 2: Create a 60-90 second audio story that:

1. **Exciting Discovery** (10-15 sec): Start with excitement - "Great news! Milo the cloud is floating right above ${location.city} today!"

2. **Where Milo Came From** (25-35 sec): Tell a warm, vivid story about Milo's recent adventure in ${adventureCity.city}, ${adventureCity.country}. Describe what Milo watched: "${adventureCity.event}". Make it visual and magical - what did Milo see from up in the sky? What sounds, colors, and happy feelings did Milo experience?

3. **Why Milo Came Here / Local Event** (15-25 sec):
   - IF you found an event happening TODAY: Mention it! Milo came to watch this exciting event from the sky. Make it sound magical that Milo arrived just in time!
   - IF you found an UPCOMING event: Mention it! Milo heard about it and wants to stick around to see it. Build excitement about Milo watching it from the sky.
   - IF NO event found: Explain that Milo floated all this way because they wanted to visit ${location.city}! Maybe Milo heard something wonderful about this place.

4. **Invitation** (10-15 sec): Encourage the listener to go outside and look up - wave at Milo! Milo can see them from up there and is so happy to be visiting.

TONE: Joyful, magical, wonder-filled. Use simple words (ages 5-10). Make kids feel special that Milo chose to visit their town. Paint vivid pictures with words.

FORMAT: Write ONLY the spoken script. No labels, no stage directions, no mention of searching. Just the story as you'd tell it excitedly to a child.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // 5-10x faster than Sonnet, still high quality
    max_tokens: 1024, // Increased to account for tool use + story
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      },
    ],
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text from response (may include tool use blocks before text)
  let storyText = '';
  for (const block of message.content) {
    if (block.type === 'text') {
      storyText = block.text;
    }
  }

  if (!storyText) {
    console.error('[generateMiloFoundStory] No text content in Claude response:', JSON.stringify(message.content));
  }

  return storyText;
}

async function generateMiloAwayStory(
  cloudInfo: CloudInfo,
  location: { city: string; region: string },
  adventureCity: CityEvent,
  temp: number,
  windSpeed: number,
  personalization: string
): Promise<string> {
  const today = new Date();
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const year = today.getFullYear();

  const prompt = `You are an enthusiastic storyteller sharing news with children about where Milo the Cloud is today!${personalization}

MILO THE CLOUD CHARACTER:
- Milo is a fluffy, friendly cumulus cloud (like a cotton ball)
- Milo loves to travel around the world and watch happy things happen
- Milo has a curious, adventurous personality and brings joy wherever they float

CURRENT SITUATION - MILO IS SOMEWHERE ELSE 🔍
- Listener's location: ${location.city}, ${location.region}
- Current sky: ${cloudInfo.scientificName} (${cloudInfo.kidFriendlyName}) - NOT Milo today
- Milo's location: ${adventureCity.city}, ${adventureCity.country}
- What Milo is watching: ${adventureCity.event}
- Temperature here: ${temp}°F, Wind: ${windSpeed} mph

STEP 1: First, quickly search the web for ONE upcoming kid-friendly event in ${location.city}, ${location.region} in the next 2 weeks (${month} ${year}). Look for family festivals, fairs, parades, farmers markets, library events, or community celebrations. Exclude adult-only events. If you find one, note the event name and when it's happening (today or upcoming). If you don't find anything suitable, that's okay - skip to Step 2.

STEP 2: Create a 60-90 second audio story that:

1. **Gentle Opening** (10-15 sec): "Today, Milo the cloud isn't floating over ${location.city}... but I know exactly where they are!"

2. **Milo's Current Adventure** (35-45 sec): Paint a vivid, exciting picture of Milo's current location in ${adventureCity.city}, ${adventureCity.country}. Describe what Milo is watching: "${adventureCity.event}". Make it magical - what does Milo see from the sky? What happy things are happening? Use sensory details (colors, sounds, feelings).

3. **Local Event Connection** (15-25 sec):
   - IF you found an event happening TODAY: Milo is sorry to be missing it but sends happy thoughts from ${adventureCity.city}. Make it sweet and show Milo cares about their friends back home.
   - IF you found an UPCOMING event: Milo is going to try to make it back in time to watch from the sky. Build anticipation and hope that Milo will return for it!
   - IF NO event found: Mention that Milo misses ${location.city} and will float back when the wind carries them this way again. Maybe next time they check, Milo will be right overhead!

4. **Encouraging Close** (10-15 sec): Encourage them to keep looking up at the sky - Milo could drift back anytime! And even though Milo isn't there today, the clouds overhead are still beautiful and worth watching.

TONE: Warm, optimistic, adventurous. Make distance feel exciting (not sad). Kids should feel like they're tracking a friend on an adventure!

FORMAT: Write ONLY the spoken script. No labels, no stage directions, no mention of searching. Just the story told warmly to a child.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // 5-10x faster than Sonnet, still high quality
    max_tokens: 1024, // Increased to account for tool use + story
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      },
    ],
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text from response (may include tool use blocks before text)
  let storyText = '';
  for (const block of message.content) {
    if (block.type === 'text') {
      storyText = block.text;
    }
  }

  if (!storyText) {
    console.error('[generateMiloAwayStory] No text content in Claude response:', JSON.stringify(message.content));
  }

  return storyText;
}
