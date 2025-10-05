// ============================================================================
// lib/cache.ts - Supabase caching layer
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import type { WeatherData, CloudInfo, CloudType } from './types';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const CACHE_DURATION_MINUTES = 15;

export function hashLocation(lat: number, lon: number): string {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  return `${roundedLat},${roundedLon}`;
}

export function hashContent(
  cloudInfo: CloudInfo,
  weatherData: WeatherData
): string {
  const content = JSON.stringify({
    cloudType: cloudInfo.type,
    temp: Math.round(weatherData.main.temp),
    coverage: Math.round(weatherData.clouds.all / 10) * 10,
  });
  return crypto.createHash('md5').update(content).digest('hex');
}

export function isCacheExpired(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created > CACHE_DURATION_MINUTES * 60000;
}

export async function getCachedWeather(locationHash: string) {
  const { data } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('location_hash', locationHash)
    .single();

  return data;
}

export async function cacheWeatherData(
  locationHash: string,
  weatherData: WeatherData,
  cloudInfo: CloudInfo
) {
  await supabase.from('weather_cache').upsert({
    location_hash: locationHash,
    cloud_type: cloudInfo.type,
    weather_data: weatherData,
    cloud_info: cloudInfo,
    created_at: new Date().toISOString(),
    expires_at: new Date(
      Date.now() + CACHE_DURATION_MINUTES * 60000
    ).toISOString(),
  });
}

export async function getCachedAudio(contentHash: string) {
  const { data } = await supabase
    .from('audio_cache')
    .select('*')
    .eq('content_hash', contentHash)
    .single();

  return data;
}

export async function cacheAudio(
  contentHash: string,
  audioUrl: string,
  transcript: string,
  cloudType: CloudType
) {
  await supabase.from('audio_cache').insert({
    content_hash: contentHash,
    audio_url: audioUrl,
    transcript,
    cloud_type: cloudType,
    created_at: new Date().toISOString(),
  });
}

export async function uploadAudio(
  audioBuffer: Buffer,
  contentHash: string
): Promise<string> {
  const fileName = `${contentHash}.mp3`;
  const { data, error } = await supabase.storage
    .from('cloud-audio')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from('cloud-audio')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

export async function getFallbackAudio() {
  const { data } = await supabase
    .from('audio_cache')
    .select('*')
    .eq('cloud_type', 'clear')
    .limit(1)
    .single();

  return {
    url: data?.audio_url || 'https://your-fallback-url.mp3',
    transcript: data?.transcript || 'Look at that beautiful clear blue sky!',
  };
}
