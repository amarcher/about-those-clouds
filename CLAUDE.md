# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloud Weather Playlist is a Next.js application that generates real-time, location-based educational audio content about clouds for Yoto players. When a child plays the card, the system detects their location via IP, fetches current weather data, identifies cloud types, generates a kid-friendly story using Claude AI, converts it to speech, and streams the audio.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm start

# Lint with Biome
npm run lint

# Format code with Biome
npm run format
```

## Architecture

### Weather-to-Audio Pipeline

The core workflow transforms real-time weather data into educational audio content:

1. **IP Geolocation** (`app/geolocation.ts`) - Extracts client IP and resolves to coordinates using ip-api.com
2. **Weather Data** (`app/weather.ts`) - Fetches current conditions from OpenWeather API
3. **Cloud Identification** (`app/cloud-identification.ts`) - Classifies cloud type based on coverage, temperature, and weather conditions
4. **Story Generation** (`app/ai.tsx`) - Claude AI with web search generates 60-90 second kid-friendly scripts incorporating local events
5. **Text-to-Speech** (`app/google-tts.ts`) - Google Cloud TTS converts to MP3 audio
6. **Storage** (`app/cache.ts`) - Uploads to Supabase Storage and caches for reuse

### Yoto Integration

**Device Code Flow** (OAuth): The setup flow uses Yoto's device authorization grant for TVless authentication:
- `app/api/yoto/device-auth/start/route.ts` - Initiates device code request
- `app/api/yoto/device-auth/poll/route.ts` - Polls for user authorization
- `app/yoto/setup/page.tsx` - Frontend displays QR code and user code

**Dynamic Streaming**: Cards use dynamic URLs that generate fresh content on each play:
- `app/api/yoto/stream/[userId]/[cardId]/route.ts` - Detects play location and redirects to audio
- `app/yoto-setup.ts` - Creates card with streaming URL pointing to the dynamic endpoint

### Caching Strategy

Two-tier caching minimizes API costs and latency:

1. **Weather Cache** (`weather_cache` table)
   - Key: Location hash (lat/lon rounded to 2 decimals)
   - TTL: 15 minutes
   - Stores: WeatherData, CloudInfo

2. **Audio Cache** (`audio_cache` table)
   - Key: Content hash (MD5 of cloud type + rounded temp + coverage)
   - TTL: Indefinite (reusable across locations/times with same conditions)
   - Stores: Audio URL, transcript, cloud type

Audio files stored in Supabase Storage bucket `cloud-audio`.

### Cloud Classification

The `identifyCloudType()` function (`app/cloud-identification.ts`) maps weather conditions to 10 cloud types:

- **Clear** - <10% coverage
- **Cumulonimbus** - Thunderstorms
- **Nimbostratus** - Heavy rain or snow
- **Stratus** - Fog/mist or light rain with >75% coverage
- **Cumulus** - Fair weather, 10-50% coverage, warm temps
- **Stratocumulus** - 50-85% coverage, warm temps
- **Cirrus** - High, thin, 10-50% coverage, cool temps
- **Cirrocumulus** - High, 50-85% coverage, cold temps
- **Altocumulus** - Mid-level, 50-85% coverage, moderate temps
- **Altostratus** - High, >85% coverage, very cold temps
- **Cirrostratus** - High, >85% coverage, cold temps

Each type includes scientific name, kid-friendly name, altitude, description, and fun fact.

### Local Events Integration

Story generation (`app/ai.tsx`) includes AI-powered web search to discover kid-friendly community events and add intrigue to Milo's stories:

**Event Discovery & Story Generation (Single API Call)**:
- Claude searches the web for events and generates the story in one request (optimized for speed)
- Looks for events in next 14 days in user's city/region
- Focuses on kid-friendly categories: family festivals, fairs, parades, farmers markets, library events, community celebrations
- Automatically filters out adult-oriented content (bars, nightclubs, comedy shows, 21+ events)
- No additional API keys required - uses Claude's web search capability

**Story Integration**:
- If Milo is present AND event is today: Milo came to watch the event from the sky
- If Milo is present AND event is upcoming: Milo wants to stick around to see it
- If Milo is away AND event is today: Milo is sorry to be missing it
- If Milo is away AND event is upcoming: Milo will try to make it back in time

**Performance**:
- Single Claude API call with web search (~7-9 seconds)
- Previous approach: 2 sequential calls (~15-18 seconds)

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (database and storage)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Weather API
OPENWEATHER_API_KEY=

# AI and TTS
ANTHROPIC_API_KEY=
GOOGLE_CLOUD_API_KEY=

# Yoto OAuth
YOTO_CLIENT_ID=
YOTO_CLIENT_SECRET=
NEXT_PUBLIC_YOTO_CLIENT_ID=
NEXT_PUBLIC_BASE_URL=
```

## Database Schema

Supabase tables:

- `weather_cache` - location_hash, cloud_type, weather_data, cloud_info, created_at, expires_at
- `audio_cache` - content_hash, audio_url, transcript, cloud_type, created_at
- `yoto_user_cards` - user_id, card_id, latitude, longitude, city, region, stream_url, created_at
- `card_plays` - user_id, card_id, ip_address, city, region, played_at

## Key Files

### Core Modules
- `app/types.ts` - TypeScript interfaces for WeatherData, CloudInfo, CloudType, Location
- `app/geolocation.ts` - IP extraction and geolocation
- `app/weather.ts` - OpenWeather API integration
- `app/cloud-identification.ts` - Cloud classification algorithm
- `app/ai.tsx` - Claude AI story generation with integrated web search for local events
- `app/google-tts.ts` - Google Cloud TTS integration
- `app/cache.ts` - Supabase client, caching, and storage utilities

### API Routes
- `app/api/yoto/playlist/route.ts` - Main pipeline endpoint (testing)
- `app/api/yoto/stream/[userId]/[cardId]/route.ts` - Dynamic streaming endpoint
- `app/api/yoto/device-auth/start/route.ts` - OAuth device code initialization
- `app/api/yoto/device-auth/poll/route.ts` - OAuth token polling
- `app/api/yoto/create-card/route.ts` - Card creation

### Frontend
- `app/yoto/setup/page.tsx` - OAuth setup wizard with QR code
