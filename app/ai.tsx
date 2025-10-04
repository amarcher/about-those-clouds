import Anthropic from '@anthropic-ai/sdk';
import { CloudInfo, WeatherData } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCloudStory(
  cloudInfo: CloudInfo,
  weatherData: WeatherData,
  location: { city: string; region: string }
): Promise<string> {
  const temp = Math.round(weatherData.main.temp);
  const windSpeed = Math.round(weatherData.wind.speed);
  const humidity = weatherData.main.humidity;

  const prompt = `You are a friendly meteorologist speaking to children aged 5-10. Create a short, engaging 60-90 second audio script about the clouds currently in the sky.
Current conditions:
- Location: ${location.city}, ${location.region}
- Cloud type: ${cloudInfo.scientificName} (${cloudInfo.kidFriendlyName})
- Altitude: ${cloudInfo.altitude}
- Temperature: ${temp}°F
- Wind speed: ${windSpeed} mph
- Humidity: ${humidity}%

Information to include:
1. Greet the listener and tell them what clouds are overhead right now
2. Describe what the clouds look like: "${cloudInfo.description}"
3. Share the fun fact: "${cloudInfo.funFact}"
4. Explain what weather patterns created these clouds (considering temp, humidity, wind)
5. Predict where these clouds might go or what weather might come next

Tone: Warm, enthusiastic, educational but playful. Use simple words and vivid imagery. Make it feel magical and exciting!

Format: Write ONLY the spoken script, no stage directions or labels. Make it conversational and fun, like you're talking to a curious kid looking up at the sky.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
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
