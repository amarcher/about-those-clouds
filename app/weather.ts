// ============================================================================
// lib/weather.ts - Weather API integration
// ============================================================================

import type { WeatherData } from './types';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;

export async function getWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  return await response.json();
}
