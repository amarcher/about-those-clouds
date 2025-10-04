// ============================================================================
// lib/types.ts - Shared TypeScript types
// ============================================================================

export interface WeatherData {
  clouds: { all: number };
  weather: Array<{ id: number; main: string; description: string }>;
  main: { temp: number; humidity: number; pressure: number };
  wind: { speed: number };
  coord: { lat: number; lon: number };
}

export type CloudType =
  | 'cumulus'
  | 'cumulonimbus'
  | 'stratus'
  | 'nimbostratus'
  | 'stratocumulus'
  | 'cirrus'
  | 'cirrostratus'
  | 'cirrocumulus'
  | 'altocumulus'
  | 'altostratus'
  | 'clear';

export interface CloudInfo {
  type: CloudType;
  scientificName: string;
  kidFriendlyName: string;
  altitude: string;
  description: string;
  funFact: string;
}

export interface Location {
  lat: number;
  lon: number;
  city: string;
  region: string;
}
