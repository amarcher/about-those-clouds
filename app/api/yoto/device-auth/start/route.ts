// ============================================================================
// app/api/yoto/device-auth/start/route.ts
// Initialize device code flow
// ============================================================================

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch(
      'https://login.yotoplay.com/oauth/device/code',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.YOTO_CLIENT_ID!,
          scope: 'profile offline_access',
          audience: 'https://api.yotoplay.com',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Device authorization failed', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      device_code: data.device_code,
      user_code: data.user_code,
      verification_uri: data.verification_uri,
      verification_uri_complete: data.verification_uri_complete,
      interval: data.interval || 5,
      expires_in: data.expires_in || 300,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
