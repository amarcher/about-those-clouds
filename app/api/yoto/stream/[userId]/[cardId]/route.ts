// ============================================================================
// Real-Time Yoto Implementation with Streaming URLs
// ============================================================================

// app/api/yoto/stream/[userId]/[cardId]/route.ts
// Dynamic audio endpoint that Yoto fetches from when card is played

import { NextRequest } from 'next/server';
import { getLocationFromIP, getClientIP } from '../../../../../geolocation';
import { getWeatherData } from '../../../../../weather';
import { identifyCloudType } from '../../../../../cloud-identification';
import { generateCloudStory } from '../../../../../ai';
import { generateSpeech } from '../../../../../tts';
import {
  hashLocation,
  hashContent,
  isCacheExpired,
  getCachedWeather,
  cacheWeatherData,
  getCachedAudio,
  cacheAudio,
  uploadAudio,
} from '../../../../../cache';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; cardId: string }> }
) {
  const { userId, cardId } = await params;

  try {
    // Get location from the request IP
    // This will be the Yoto player's IP when it fetches the audio
    const ip = getClientIP(req);
    console.log(
      `Stream request from IP: ${ip} for user: ${userId}, card: ${cardId}`
    );

    const location = await getLocationFromIP(ip);
    console.log(`Detected location: ${location.city}, ${location.region}`);

    // Track the play with location info (optional analytics)
    await supabase.from('card_plays').insert({
      user_id: userId,
      card_id: cardId,
      ip_address: ip,
      city: location.city,
      region: location.region,
      played_at: new Date().toISOString(),
    });

    return streamCloudWeather(location);
  } catch (error) {
    console.error('Stream error:', error);

    // Fallback to generic clear sky audio
    const fallbackUrl =
      'https://your-supabase-url/storage/v1/object/public/cloud-audio/fallback.mp3';
    return Response.redirect(fallbackUrl, 302);
  }
}

async function streamCloudWeather(location: {
  lat: number;
  lon: number;
  city: string;
  region: string;
}) {
  // Check weather cache
  const locationHash = hashLocation(location.lat, location.lon);
  const cachedWeather = await getCachedWeather(locationHash);

  let weatherData, cloudInfo;

  if (cachedWeather && !isCacheExpired(cachedWeather.created_at)) {
    weatherData = cachedWeather.weather_data;
    cloudInfo = cachedWeather.cloud_info;
  } else {
    weatherData = await getWeatherData(location.lat, location.lon);
    cloudInfo = identifyCloudType(weatherData);
    await cacheWeatherData(locationHash, weatherData, cloudInfo);
  }

  // Check audio cache
  const contentHash = hashContent(cloudInfo, weatherData);
  const cachedAudio = await getCachedAudio(contentHash);

  let audioUrl;

  if (cachedAudio) {
    audioUrl = cachedAudio.audio_url;
  } else {
    const transcript = await generateCloudStory(
      cloudInfo,
      weatherData,
      location
    );
    const audioBuffer = await generateSpeech(transcript);
    audioUrl = await uploadAudio(audioBuffer, contentHash);
    await cacheAudio(contentHash, audioUrl, transcript, cloudInfo.type);
  }

  // Redirect to the audio file (or stream it directly)
  return Response.redirect(audioUrl, 302);
}
