// ============================================================================
// lib/yoto-setup.ts - One-time card setup with browser auth
// ============================================================================

import { supabase } from './cache';
import fs from 'fs/promises';
import path from 'path';

async function uploadCoverImageToYoto(accessToken: string): Promise<string> {
  try {
    // Read the cover image file
    const imagePath = path.join(process.cwd(), 'public', 'cloud-card-cover.png');
    console.log('Reading cover image from:', imagePath);
    const imageBuffer = await fs.readFile(imagePath);
    console.log('Cover image size:', imageBuffer.length, 'bytes');

    // Upload to Yoto's CDN
    const uploadResponse = await fetch(
      'https://api.yotoplay.com/media/coverImage/user/me/upload?autoconvert=true&coverType=default',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/png',
        },
        body: new Uint8Array(imageBuffer),
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cover upload failed:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload cover image: ${uploadResponse.statusText} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('Cover image uploaded successfully:', uploadResult.coverImage.mediaUrl);
    return uploadResult.coverImage.mediaUrl;
  } catch (error) {
    console.error('Error uploading cover image:', error);
    throw error;
  }
}

export async function createDynamicCard(
  accessToken: string,
  userId: string,
  location: { lat: number; lon: number; city: string; region: string }
): Promise<{ cardId: string; playlistUrl: string }> {
  // Generate unique card ID
  const cardId = `cloud-weather-${userId}-${Date.now()}`;

  // Upload cover image to Yoto (one-time per card creation)
  const coverImageUrl = await uploadCoverImageToYoto(accessToken);

  // Create playlist with streaming URL
  const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/stream/${userId}/${cardId}`;
  const iconUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/icon/${userId}/${cardId}`;

  console.log('Stream URL:', streamUrl);
  console.log('Icon URL:', iconUrl);
  console.log('Cover URL:', coverImageUrl);

  const playlist = {
    title: 'Cloud Weather Reporter',
    description: 'Real-time cloud weather based on your location',
    cover: {
      imageL: coverImageUrl
    },
    chapters: [
      {
        key: '01',
        title: "Today's Cloud Weather",
        display: { iconUrl16x16: iconUrl },
        tracks: [
          {
            key: '01',
            title: 'Live Cloud Weather',
            trackUrl: streamUrl,
            overlayLabel: '1',
            duration: 90,
            fileSize: 1500000,
            channels: 'stereo',
            format: 'mp3',
            type: 'stream',
            display: { iconUrl16x16: iconUrl }
          },
        ],
      },
    ],
  };

  console.log('Playlist payload:', JSON.stringify(playlist, null, 2));

  // Create the card via Yoto API
  const response = await fetch('https://api.yotoplay.com/content', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: playlist }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Card creation failed:', response.status, errorText);
    throw new Error(`Failed to create card: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Card created successfully:', result);

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
