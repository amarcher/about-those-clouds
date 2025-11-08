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
import { generateSpeech } from '../../../../../google-tts';
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
import type { Child } from '../../../../../types';

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
    console.time('🎵 Total request time');

    // Parse children data from URL parameters (privacy-friendly storage)
    const url = new URL(req.url);
    const childrenParam = url.searchParams.get('children');
    let children: Child[] | undefined;

    if (childrenParam) {
      try {
        children = JSON.parse(decodeURIComponent(childrenParam));
        console.log('Parsed children data:', children);
      } catch (e) {
        console.error('Failed to parse children parameter:', e);
      }
    }

    // Get location from the request IP
    // This will be the Yoto player's IP when it fetches the audio
    const ip = getClientIP(req);
    console.log(
      `Stream request from IP: ${ip} for user: ${userId}, card: ${cardId}`
    );

    console.time('📍 Geolocation lookup');
    const location = await getLocationFromIP(ip);
    console.timeEnd('📍 Geolocation lookup');
    console.log(`Detected location: ${location.city}, ${location.region}`);

    // Track the play with location info (optional analytics)
    try {
      await supabase.from('card_plays').insert({
        user_id: userId,
        card_id: cardId,
        ip_address: ip,
        city: location.city,
        region: location.region,
        played_at: new Date().toISOString(),
      });
    } catch (trackingError) {
      // Don't fail the entire request if tracking fails
      console.error('Failed to track play (non-critical):', trackingError);
    }

    const response = await streamCloudWeather(location, children);
    console.timeEnd('🎵 Total request time');
    return response;
  } catch (error) {
    console.error('Stream error:', error);

    // Log specific error types for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if ('originalError' in error) {
        console.error('Original error:', (error as any).originalError);
      }
    }

    // Return a simple audio message instead of redirecting to non-existent URL
    // This ensures the Yoto player gets valid audio content even if everything fails
    return new Response(
      JSON.stringify({
        error: 'Unable to generate audio content',
        message: 'Please try again later'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function streamCloudWeather(
  location: {
    lat: number;
    lon: number;
    city: string;
    region: string;
  },
  children?: Child[]
) {
  // Check weather cache
  const locationHash = hashLocation(location.lat, location.lon);
  let cachedWeather;

  console.time('💾 Weather cache lookup');
  try {
    cachedWeather = await getCachedWeather(locationHash);
  } catch (cacheError) {
    console.error('Failed to read weather cache (will fetch fresh):', cacheError);
  }
  console.timeEnd('💾 Weather cache lookup');

  let weatherData, cloudInfo;

  if (cachedWeather && !isCacheExpired(cachedWeather.created_at)) {
    console.log('✅ Using cached weather data');
    weatherData = cachedWeather.weather_data;
    cloudInfo = cachedWeather.cloud_info;
  } else {
    console.time('🌤️  Weather API fetch');
    weatherData = await getWeatherData(location.lat, location.lon);
    cloudInfo = identifyCloudType(weatherData);
    console.timeEnd('🌤️  Weather API fetch');

    try {
      await cacheWeatherData(locationHash, weatherData, cloudInfo);
    } catch (cacheError) {
      console.error('Failed to cache weather data (non-critical):', cacheError);
    }
  }

  // Check audio cache - personalized content needs unique hash
  const contentHash = hashContent(cloudInfo, weatherData);
  let cachedAudio;

  console.time('💾 Audio cache lookup');
  try {
    cachedAudio = await getCachedAudio(contentHash);
  } catch (cacheError) {
    console.error('Failed to read audio cache (will generate fresh):', cacheError);
  }
  console.timeEnd('💾 Audio cache lookup');

  let audioUrl;

  // Only use cache if no personalization (children empty/undefined)
  const hasPersonalization = children && children.length > 0;

  if (cachedAudio && !hasPersonalization) {
    console.log('✅ Using cached audio for content hash:', contentHash);
    audioUrl = cachedAudio.audio_url;
  } else {
    console.log('🎨 Generating fresh audio for content hash:', contentHash);

    console.time('🤖 AI story generation');
    const transcript = await generateCloudStory(
      cloudInfo,
      weatherData,
      {
        city: location.city,
        region: location.region,
        lat: location.lat,
        lon: location.lon,
      },
      children
    );
    console.timeEnd('🤖 AI story generation');
    console.log(`📝 Generated transcript (${transcript.length} chars)`);

    console.time('🔊 Text-to-speech');
    const audioBuffer = await generateSpeech(transcript);
    console.timeEnd('🔊 Text-to-speech');
    console.log(`🎵 Generated audio (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

    console.time('☁️  Upload to Supabase');
    audioUrl = await uploadAudio(audioBuffer, contentHash);
    console.timeEnd('☁️  Upload to Supabase');

    // Only cache non-personalized content (reusable)
    if (!hasPersonalization) {
      try {
        await cacheAudio(contentHash, audioUrl, transcript, cloudInfo.type);
      } catch (cacheError) {
        console.error('Failed to cache audio (non-critical):', cacheError);
      }
    }
  }

  // Redirect to the audio file (or stream it directly)
  return Response.redirect(audioUrl, 302);
}
