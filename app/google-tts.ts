// ============================================================================
// lib/tts.ts - Google text-to-speech
// ============================================================================
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

export async function generateSpeech(text: string): Promise<Buffer> {
  console.log(`Generating speech (${text.length} chars)...`);

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-C', // Fast, reliable voice (Journey was too slow)
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

  const responseText = await response.text();

  if (!response.ok) {
    // Only log response on error
    console.log('Error response body:', responseText.substring(0, 500));
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
