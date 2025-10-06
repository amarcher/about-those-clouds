import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId } = await req.json();

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Missing accessToken or userId' },
        { status: 400 }
      );
    }

    // Generate unique card ID
    const cardId = `cloud-weather-${userId}-${Date.now()}`;
    const streamUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/yoto/stream/${userId}/${cardId}`;

    // Create playlist with streaming URL
    const playlist = {
      title: 'Cloud Weather Reporter',
      chapters: [
        {
          key: '01',
          title: "Today's Cloud Weather",
          display: { icon16x16: null },
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
            },
          ],
        },
      ],
    };

    const response = await fetch('https://api.yotoplay.com/content', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: playlist }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Yoto API failed: ${error}`);
    }

    const result = await response.json();

    // Store card info
    await supabase.from('yoto_user_cards').insert({
      user_id: userId,
      card_id: result.cardId || cardId,
      stream_url: streamUrl,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      cardId: result.cardId || cardId,
      playlistUrl: streamUrl,
      instructions: [
        'Your dynamic cloud weather card is ready!',
        'In the Yoto app, go to "Make Your Own"',
        'Find your new "Cloud Weather Reporter" playlist',
        'Link it to a blank MYO card',
        "Every time you play it, you'll hear current weather for your location!",
        'Take the card anywhere - it automatically detects where you are!',
      ],
    });
  } catch (error: any) {
    console.error('Card creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
