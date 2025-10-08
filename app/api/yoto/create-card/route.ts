import { NextRequest, NextResponse } from 'next/server';
import { createDynamicCard } from '@/app/yoto-setup';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId, location } = await req.json();

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Missing accessToken or userId' },
        { status: 400 }
      );
    }

    // Default location if not provided (will use IP geolocation during playback)
    const userLocation = location || {
      lat: 0,
      lon: 0,
      city: 'Unknown',
      region: 'Unknown'
    };

    // Use the createDynamicCard function which includes cover art and icons
    const { cardId, playlistUrl } = await createDynamicCard(
      accessToken,
      userId,
      userLocation
    );

    return NextResponse.json({
      success: true,
      cardId,
      playlistUrl,
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
