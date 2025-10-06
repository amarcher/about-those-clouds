// ============================================================================
// lib/tts.ts - ElevenLabs text-to-speech
// ============================================================================

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

export async function generateSpeech(text: string): Promise<Buffer> {
  // Debug logging
  console.log('ElevenLabs Voice ID:', ELEVENLABS_VOICE_ID);
  console.log('API Key exists:', !!ELEVENLABS_API_KEY);
  console.log('API Key length:', ELEVENLABS_API_KEY?.length);
  console.log('API Key first 10 chars:', ELEVENLABS_API_KEY?.substring(0, 10));

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  console.log('ElevenLabs response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs error response:', errorText);
    throw new Error(`ElevenLabs error: ${response.statusText} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
