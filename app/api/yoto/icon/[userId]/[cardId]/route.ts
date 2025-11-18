import { NextRequest } from 'next/server';
import { getLocationFromIP, getClientIP } from '../../../../../geolocation';
import { getWeatherData } from '../../../../../weather';
import { identifyCloudType } from '../../../../../cloud-identification';
import {
  hashLocation,
  getCachedWeather,
  cacheWeatherData,
  isCacheExpired,
} from '../../../../../cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; cardId: string }> }
) {
  try {
    const { userId, cardId } = await params;
    console.log('Icon request for userId:', userId, 'cardId:', cardId);

    // Get location from IP (same as stream endpoint)
    const ip = getClientIP(req);
    console.log('Icon request from IP:', ip);
    const location = await getLocationFromIP(ip);
    console.log('Icon location:', location);

    // Check weather cache
    const locationHash = hashLocation(location.lat, location.lon);
    const cachedWeather = await getCachedWeather(locationHash);

    let cloudInfo;

    if (cachedWeather && !isCacheExpired(cachedWeather.created_at)) {
      cloudInfo = cachedWeather.cloud_info;
      console.log('Using cached weather for icon, cloud type:', cloudInfo.type);
    } else {
      const weatherData = await getWeatherData(location.lat, location.lon);
      cloudInfo = identifyCloudType(weatherData);
      await cacheWeatherData(locationHash, weatherData, cloudInfo);
      console.log('Fetched fresh weather for icon, cloud type:', cloudInfo.type);
    }

    // Redirect to locally hosted Yoto emoji icon
    const iconPath = `/icons/${cloudInfo.type.toLowerCase()}.png`;
    const iconUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${iconPath}`;

    console.log('Redirecting to local icon:', iconUrl);

    return Response.redirect(iconUrl, 302);
  } catch (error) {
    console.error('Icon generation error:', error);

    // Fallback to cumulus icon
    const defaultIconUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/icons/cumulus.png`;
    return Response.redirect(defaultIconUrl, 302);
  }
}
