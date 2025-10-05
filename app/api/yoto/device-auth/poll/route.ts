// ============================================================================
// app/api/yoto/device-auth/poll/route.ts
// Poll for token
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { device_code } = await req.json();

    const response = await fetch('https://login.yotoplay.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code,
        client_id: process.env.YOTO_CLIENT_ID!,
        audience: 'https://api.yotoplay.com',
      }),
    });

    const data = await response.json();

    // Success
    if (response.ok) {
      return NextResponse.json({
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    }

    // Authorization pending or other errors
    if (response.status === 403) {
      if (data.error === 'authorization_pending') {
        return NextResponse.json({ pending: true });
      }
      if (data.error === 'slow_down') {
        return NextResponse.json({ slow_down: true });
      }
      if (data.error === 'expired_token') {
        return NextResponse.json(
          { error: 'Device code expired' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: data.error_description || data.error },
      { status: response.status }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
