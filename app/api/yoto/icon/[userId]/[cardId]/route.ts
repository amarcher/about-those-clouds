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
import { getCloudIcon } from '../../../../../cloud-icons';
import { getYotoIconUrl, extractIconHash } from '../../../../../yoto-icons';

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

    // Get Yoto emoji icon ID for this cloud type
    const yotoIconId = getCloudIcon(cloudInfo.type);
    const iconHash = extractIconHash(yotoIconId);
    console.log('Cloud type:', cloudInfo.type, 'Yoto icon:', yotoIconId);

    // Fetch the actual icon URL from Yoto's API
    const iconUrl = await getYotoIconUrl(iconHash);

    if (iconUrl) {
      console.log('Redirecting to Yoto icon URL:', iconUrl);
      return Response.redirect(iconUrl, 302);
    } else {
      // Fallback: use a default icon ID if we couldn't fetch the URL
      console.warn('Could not fetch Yoto icon URL, using fallback');
      // Use cumulus icon as fallback
      const fallbackHash = extractIconHash(getCloudIcon('cumulus'));
      const fallbackUrl = await getYotoIconUrl(fallbackHash);

      if (fallbackUrl) {
        return Response.redirect(fallbackUrl, 302);
      } else {
        throw new Error('Unable to fetch any Yoto icon URLs');
      }
    }
  } catch (error) {
    console.error('Icon generation error:', error);

    // Last resort fallback - use a placeholder image or return error
    return new Response('Icon not available', { status: 404 });
  }
}
