import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    console.log('Exchanging code for token...');
    console.log('Client ID:', process.env.YOTO_CLIENT_ID);
    console.log(
      'Redirect URI:',
      `${process.env.NEXT_PUBLIC_BASE_URL}/yoto/setup`
    );

    const response = await fetch('https://login.yotoplay.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.YOTO_CLIENT_ID!,
        client_secret: process.env.YOTO_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/yoto/setup`,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const text = await response.text();
    console.log('Response body:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
      return NextResponse.json(
        { error: 'Invalid response from Yoto', details: text },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error_description || data.error || 'Token exchange failed',
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ access_token: data.access_token });
  } catch (error: any) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
