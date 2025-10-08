import { NextRequest, NextResponse } from 'next/server';
import { getLocationFromIP, getClientIP } from '../../../../../geolocation';
import { getWeatherData } from '../../../../../weather';
import { identifyCloudType } from '../../../../../cloud-identification';
import {
  hashLocation,
  getCachedWeather,
  cacheWeatherData,
  isCacheExpired,
} from '../../../../../cache';
import sharp from 'sharp';

// Map cloud types to visual designs
const CLOUD_DESIGNS: Record<string, { bg: string; fg: string; pattern: string }> = {
  clear: { bg: '#FFD700', fg: '#FFA500', pattern: 'sun' },
  cumulus: { bg: '#FFFFFF', fg: '#E0E0E0', pattern: 'puffy' },
  stratus: { bg: '#C0C0C0', fg: '#A0A0A0', pattern: 'flat' },
  stratocumulus: { bg: '#D3D3D3', fg: '#B0B0B0', pattern: 'layered' },
  nimbostratus: { bg: '#696969', fg: '#505050', pattern: 'rain' },
  cumulonimbus: { bg: '#4B0082', fg: '#8B008B', pattern: 'storm' },
  cirrus: { bg: '#F0F8FF', fg: '#D0E8FF', pattern: 'wispy' },
  cirrocumulus: { bg: '#E6E6FA', fg: '#D8BFD8', pattern: 'dots' },
  cirrostratus: { bg: '#DCDCDC', fg: '#C0C0C0', pattern: 'halo' },
  altocumulus: { bg: '#B0C4DE', fg: '#9FB4CD', pattern: 'patches' },
  altostratus: { bg: '#A9A9A9', fg: '#909090', pattern: 'veil' },
};

// Generate a 16x16 PNG icon based on cloud type
async function generateCloudIcon(cloudType: string): Promise<Buffer> {
  const design = CLOUD_DESIGNS[cloudType.toLowerCase()] || CLOUD_DESIGNS.cumulus;

  // Create SVG with cloud pattern
  const svg = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" fill="${design.bg}"/>
      ${generatePattern(design.pattern, design.fg)}
    </svg>
  `;

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(16, 16)
    .png()
    .toBuffer();

  return pngBuffer;
}

// Generate SVG pattern based on cloud type
function generatePattern(pattern: string, color: string): string {
  switch (pattern) {
    case 'sun':
      return `<circle cx="8" cy="8" r="5" fill="${color}"/>`;
    case 'puffy':
      return `<circle cx="5" cy="10" r="4" fill="${color}"/><circle cx="11" cy="10" r="4" fill="${color}"/><circle cx="8" cy="7" r="4" fill="${color}"/>`;
    case 'flat':
      return `<rect x="2" y="8" width="12" height="4" fill="${color}"/>`;
    case 'layered':
      return `<rect x="2" y="6" width="12" height="2" fill="${color}"/><rect x="2" y="10" width="12" height="2" fill="${color}"/>`;
    case 'rain':
      return `<rect x="2" y="4" width="12" height="4" fill="${color}"/><line x1="4" y1="10" x2="4" y2="13" stroke="${color}" stroke-width="1"/><line x1="8" y1="10" x2="8" y2="13" stroke="${color}" stroke-width="1"/><line x1="12" y1="10" x2="12" y2="13" stroke="${color}" stroke-width="1"/>`;
    case 'storm':
      return `<rect x="2" y="4" width="12" height="4" fill="${color}"/><polygon points="8,10 6,13 10,13" fill="${color}"/>`;
    case 'wispy':
      return `<path d="M 2 8 Q 5 6, 8 8 T 14 8" stroke="${color}" stroke-width="1" fill="none"/><path d="M 2 11 Q 5 9, 8 11 T 14 11" stroke="${color}" stroke-width="1" fill="none"/>`;
    case 'dots':
      return `<circle cx="3" cy="5" r="1" fill="${color}"/><circle cx="7" cy="5" r="1" fill="${color}"/><circle cx="11" cy="5" r="1" fill="${color}"/><circle cx="3" cy="10" r="1" fill="${color}"/><circle cx="7" cy="10" r="1" fill="${color}"/><circle cx="11" cy="10" r="1" fill="${color}"/>`;
    case 'halo':
      return `<circle cx="8" cy="8" r="6" stroke="${color}" stroke-width="1" fill="none"/>`;
    case 'patches':
      return `<circle cx="5" cy="6" r="2" fill="${color}"/><circle cx="11" cy="6" r="2" fill="${color}"/><circle cx="5" cy="11" r="2" fill="${color}"/><circle cx="11" cy="11" r="2" fill="${color}"/>`;
    case 'veil':
      return `<rect x="0" y="6" width="16" height="4" fill="${color}" opacity="0.7"/>`;
    default:
      return `<circle cx="8" cy="8" r="4" fill="${color}"/>`;
  }
}

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

    // Generate icon based on cloud type
    const iconBuffer = await generateCloudIcon(cloudInfo.type);
    console.log('Generated icon buffer size:', iconBuffer.length);

    return new NextResponse(new Uint8Array(iconBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
      },
    });
  } catch (error) {
    console.error('Icon generation error:', error);

    // Return a default cloud icon on error
    const defaultSvg = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" fill="#FFFFFF"/>
        <circle cx="8" cy="8" r="4" fill="#E0E0E0"/>
      </svg>
    `;

    const defaultPng = await sharp(Buffer.from(defaultSvg))
      .resize(16, 16)
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(defaultPng), {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }
}
