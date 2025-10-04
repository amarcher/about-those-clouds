// app/api/yoto/playlist/route.ts - PRODUCTION VERSION

import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, getLocationFromIP } from '../../../geolocation';
import { getWeatherData } from '../../../weather';
import { identifyCloudType } from '../../../cloud-identification';
import { generateCloudStory } from '../../../ai';
import { generateSpeech } from '../../../tts';
import {
  hashLocation,
  hashContent,
  isCacheExpired,
  getCachedWeather,
  cacheWeatherData,
  getCachedAudio,
  cacheAudio,
  uploadAudio,
  getFallbackAudio,
} from '../../../cache';

export async function POST(req: NextRequest) {
  try {
    // Get IP address from request
    const ip = getClientIP(req);

    // Get geolocation from IP
    const location = await getLocationFromIP(ip);

    // Check cache for recent weather data
    const locationHash = hashLocation(location.lat, location.lon);
    const cachedWeather = await getCachedWeather(locationHash);

    let weatherData, cloudInfo;

    if (cachedWeather && !isCacheExpired(cachedWeather.created_at)) {
      // Use cached weather data
      weatherData = cachedWeather.weather_data;
      cloudInfo = cachedWeather.cloud_info;
    } else {
      // Fetch fresh weather data
      weatherData = await getWeatherData(location.lat, location.lon);

      // Identify cloud type
      cloudInfo = identifyCloudType(weatherData);

      // Cache weather data
      await cacheWeatherData(locationHash, weatherData, cloudInfo);
    }

    // Generate content hash for audio caching
    const contentHash = hashContent(cloudInfo, weatherData);

    // Check if we have cached audio for this exact content
    const cachedAudio = await getCachedAudio(contentHash);

    let audioUrl, transcript;

    if (cachedAudio) {
      // Use cached audio
      audioUrl = cachedAudio.audio_url;
      transcript = cachedAudio.transcript;
    } else {
      // Generate story with Claude
      transcript = await generateCloudStory(cloudInfo, weatherData, location);

      // Convert to speech with ElevenLabs
      const audioBuffer = await generateSpeech(transcript);

      // Upload audio to Supabase Storage
      audioUrl = await uploadAudio(audioBuffer, contentHash);

      // Cache the audio
      await cacheAudio(contentHash, audioUrl, transcript, cloudInfo.type);
    }

    // Return response for Yoto
    return NextResponse.json({
      success: true,
      audioUrl,
      transcript,
      cloudType: cloudInfo.scientificName,
      location: {
        city: location.city,
        region: location.region,
      },
    });
  } catch (error) {
    console.error('Pipeline error:', error);

    // Fallback: return generic clear sky content
    const fallbackAudio = await getFallbackAudio();

    return NextResponse.json({
      success: true,
      audioUrl: fallbackAudio.url,
      transcript: fallbackAudio.transcript,
      cloudType: 'Clear Sky',
      fallback: true,
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
