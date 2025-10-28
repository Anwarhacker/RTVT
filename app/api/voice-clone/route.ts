import { NextRequest, NextResponse } from 'next/server';

// Note: This is a basic implementation. For production, consider user authentication and voice model storage.
// ElevenLabs requires audio samples to train voice models, which can be costly and time-consuming.
// This example shows the structure; implement proper error handling and rate limiting.

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const description = formData.get('description') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Check file size (ElevenLabs recommends 1-10 seconds minimum)
    if (audioFile.size > 25 * 1024 * 1024) { // 25MB max
      return NextResponse.json({ error: 'Audio file too large. Max 25MB' }, { status: 400 });
    }

    // Add voice to ElevenLabs library
    const addVoiceResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Cloned Voice ${Date.now()}`,
        description: description || 'Custom cloned voice',
        files: [
          {
            file_name: audioFile.name,
            chunk_size: audioFile.size,
          }
        ],
        labels: {
          accent: 'neutral',
          age: 'adult',
          gender: 'neutral'
        }
      }),
    });

    if (!addVoiceResponse.ok) {
      throw new Error('Failed to add voice');
    }

    const addVoiceData = await addVoiceResponse.json();

    // Upload audio sample
    const voiceId = addVoiceData.voice_id;

    const audioBuffer = await audioFile.arrayBuffer();

    const uploadResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/edit`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'audio/mpeg',
      },
      body: audioBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio');
    }

    return NextResponse.json({
      success: true,
      voiceId,
      message: 'Voice cloning initiated. Model will be available soon.'
    });

  } catch (error: any) {
    console.error('Voice cloning error:', error.message);
    return NextResponse.json({
      error: 'Failed to clone voice. Check audio quality and try again.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { voiceId } = await request.json();

    if (!voiceId) {
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }

    const deleteResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete voice');
    }

    return NextResponse.json({ success: true, message: 'Voice deleted' });

  } catch (error: any) {
    console.error('Delete voice error:', error.message);
    return NextResponse.json({ error: 'Failed to delete voice' }, { status: 500 });
  }
}
