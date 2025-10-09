// ============================================================================
// lib/yoto-setup.ts - One-time card setup with browser auth
// ============================================================================

import { supabase } from './cache';
import fs from 'fs/promises';
import path from 'path';

async function uploadCoverImageToYoto(accessToken: string): Promise<{
  imageL: string;
  imageM: string;
  imageS: string;
}> {
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
    console.log('Cover upload result:', JSON.stringify(uploadResult, null, 2));
    console.log('Cover image uploaded successfully:', uploadResult.coverImage.mediaUrl);

    // Return in the format Yoto expects for metadata.cover
    return {
      imageL: uploadResult.coverImage.mediaUrl,
      imageM: uploadResult.coverImage.mediaUrl,
      imageS: uploadResult.coverImage.mediaUrl,
    };
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
  const coverImage = await uploadCoverImageToYoto(accessToken);

  // Create playlist with streaming URL
  const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/stream/${userId}/${cardId}`;
  const iconUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/icon/${userId}/${cardId}`;

  console.log('Stream URL:', streamUrl);
  console.log('Icon URL:', iconUrl);
  console.log('Cover image object:', coverImage);

  const content = {
    title: 'Cloud Weather Reporter',
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
            display: { iconUrl16x16: iconUrl },
          },
        ],
      },
    ],
  };

  const metadata = {
    cover: coverImage,
    description: "Learn about today's cloud weather wherever you are!",
    languages: ['en'],
    author: 'Andrew Archer',
    category: 'radio',
  };

  const cardPayload = {
    title: 'Cloud Weather Reporter',
    metadata,
    content,
    tags: ['education', 'weather', 'science'],
  };

  console.log('Card payload:', JSON.stringify(cardPayload, null, 2));

  // Create the card via Yoto API
  const response = await fetch('https://api.yotoplay.com/content', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Card creation failed:', response.status, errorText);
    throw new Error(`Failed to create card: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Card created successfully:', JSON.stringify(result, null, 2));

  // Log what Yoto returned for debugging
  console.log('--- Yoto API Response Analysis ---');
  console.log('Returned card ID:', result.cardId || result.card?._id);
  console.log('Returned content structure:', JSON.stringify(result.card?.content || result.content, null, 2));

  if (result.card?.content?.metadata) {
    console.log('✓ Metadata exists in response');
    console.log('  Cover image (imageL):', result.card.content.metadata.cover?.imageL);
    console.log('  Cover image (mediaUrl):', result.card.content.metadata.cover?.mediaUrl);
    console.log('  Full cover object:', JSON.stringify(result.card.content.metadata.cover));
  } else {
    console.log('✗ No metadata in response');
  }

  if (result.card?.content?.chapters?.[0]?.display) {
    console.log('✓ Chapter display exists in response');
    console.log('  Chapter icon URL:', result.card.content.chapters[0].display.iconUrl16x16);
  } else {
    console.log('✗ No chapter display in response');
  }

  if (result.card?.content?.chapters?.[0]?.tracks?.[0]?.display) {
    console.log('✓ Track display exists in response');
    console.log('  Track icon URL:', result.card.content.chapters[0].tracks[0].display.iconUrl16x16);
  } else {
    console.log('✗ No track display in response');
  }
  console.log('--- End Response Analysis ---');

  // Store card config in database
  const insertResult = await supabase.from('yoto_user_cards').insert({
    user_id: userId,
    card_id: result.cardId || cardId,
    stream_url: streamUrl,
    created_at: new Date().toISOString(),
  });

  if (insertResult.error) {
    console.error('Failed to store card in database:', insertResult.error);
  } else {
    console.log('✓ Card stored in database successfully');
  }

  return {
    cardId: result.cardId || cardId,
    playlistUrl: streamUrl,
  };
}
