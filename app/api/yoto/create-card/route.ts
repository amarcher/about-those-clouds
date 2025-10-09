import { NextRequest, NextResponse } from 'next/server';
import { createDynamicCard } from '@/app/yoto-setup';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Card Creation Started ===');
    const { accessToken, userId, location } = await req.json();
    console.log('Request data:', { userId, location });

    if (!accessToken || !userId) {
      console.error('Missing required fields');
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

    console.log('Creating dynamic card...');
    // Use the createDynamicCard function which includes cover art and icons
    const { cardId, playlistUrl } = await createDynamicCard(
      accessToken,
      userId,
      userLocation
    );

    console.log('Card created successfully:', { cardId, playlistUrl });
    console.log('=== Card Creation Complete ===');

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
    console.error('=== Card creation error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
