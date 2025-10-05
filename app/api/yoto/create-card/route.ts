// ============================================================================
// app/api/yoto/create-card/route.ts - Setup endpoint
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createDynamicCard } from '../../../yoto-setup';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId, location } = await req.json();

    if (!accessToken || !userId || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { cardId, playlistUrl } = await createDynamicCard(
      accessToken,
      userId,
      location
    );

    return NextResponse.json({
      success: true,
      cardId,
      playlistUrl,
      instructions: [
        'Your dynamic cloud weather card is ready!',
        'In the Yoto app, go to "Make Your Own"',
        'Find your new "Cloud Weather" playlist',
        'Link it to a blank MYO card',
        "Every time you play it, you'll hear current weather!",
      ],
    });
  } catch (error: any) {
    console.error('Card creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
