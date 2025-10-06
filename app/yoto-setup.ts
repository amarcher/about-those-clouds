// ============================================================================
// lib/yoto-setup.ts - One-time card setup with browser auth
// ============================================================================

import { supabase } from './cache';

export async function createDynamicCard(
  accessToken: string,
  userId: string,
  location: { lat: number; lon: number; city: string; region: string }
): Promise<{ cardId: string; playlistUrl: string }> {
  // Generate unique card ID
  const cardId = `cloud-weather-${userId}-${Date.now()}`;

  // Create playlist with streaming URL
  const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/stream/${userId}/${cardId}`;

  const playlist = {
    title: `Cloud Weather - ${location.city}`,
    chapters: [
      {
        key: '01',
        title: "Today's Cloud Weather",
        display: { icon16x16: null },
        tracks: [
          {
            key: '01',
            title: `Live Cloud Weather`,
            trackUrl: streamUrl, // Dynamic URL!
            overlayLabel: '1',
            duration: 90,
            fileSize: 1500000,
            channels: 'stereo' as const,
            format: 'mp3' as const,
            type: 'stream' as const,
          },
        ],
      },
    ],
  };

  // Create the card via Yoto API
  const response = await fetch('https://api.yotoplay.com/content', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: playlist,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create card: ${response.statusText}`);
  }

  const result = await response.json();

  // Store card config in database
  await supabase.from('yoto_user_cards').insert({
    user_id: userId,
    card_id: result.cardId || cardId,
    latitude: location.lat,
    longitude: location.lon,
    city: location.city,
    region: location.region,
    stream_url: streamUrl,
    created_at: new Date().toISOString(),
  });

  return {
    cardId: result.cardId || cardId,
    playlistUrl: streamUrl,
  };
}
