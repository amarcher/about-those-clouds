// ============================================================================
// app/api/yoto/playlist/route.ts - Main API endpoint
// ============================================================================

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
    const ip = getClientIP(req);
    const location = await getLocationFromIP(ip);

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

    const contentHash = hashContent(cloudInfo, weatherData);
    const cachedAudio = await getCachedAudio(contentHash);

    let audioUrl, transcript;

    if (cachedAudio) {
      audioUrl = cachedAudio.audio_url;
      transcript = cachedAudio.transcript;
    } else {
      transcript = await generateCloudStory(cloudInfo, weatherData, location);
      const audioBuffer = await generateSpeech(transcript);
      audioUrl = await uploadAudio(audioBuffer, contentHash);
      await cacheAudio(contentHash, audioUrl, transcript, cloudInfo.type);
    }

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
