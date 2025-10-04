// lib/geolocation.ts
import type { Location } from './types';

export function getClientIP(req: any): string {
  // For Next.js App Router, headers are accessed differently
  const forwardedFor =
    req.headers.get?.('x-forwarded-for') || req.headers['x-forwarded-for'];
  const realIp = req.headers.get?.('x-real-ip') || req.headers['x-real-ip'];

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback for testing
  return '8.8.8.8';
}

export async function getLocationFromIP(ip: string): Promise<Location> {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const data = await response.json();

  if (data.status === 'fail') {
    return {
      lat: 42.443,
      lon: -71.2289,
      city: 'Lexington',
      region: 'MA',
    };
  }

  return {
    lat: data.lat,
    lon: data.lon,
    city: data.city,
    region: data.regionName,
  };
}
