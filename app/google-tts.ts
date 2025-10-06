// ============================================================================
// lib/tts.ts - Google text-to-speech
// ============================================================================
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

export async function generateSpeech(text: string): Promise<Buffer> {
  console.log('Generating speech with Google Cloud TTS...');
  console.log('Text length:', text.length);
  console.log('API key exists:', !!GOOGLE_CLOUD_API_KEY);

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-C',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      }),
    }
  );

  console.log('Response status:', response.status);
  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (!response.ok) {
    throw new Error(
      `Google TTS error: ${response.statusText} - ${responseText}`
    );
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse response: ${responseText}`);
  }

  if (!data.audioContent) {
    console.error('No audioContent in response:', data);
    throw new Error('No audio content returned from Google TTS');
  }

  return Buffer.from(data.audioContent, 'base64');
}
