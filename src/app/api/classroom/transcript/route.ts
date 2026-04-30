import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Failed to fetch transcript:', error);
    return NextResponse.json({ error: 'Failed to fetch transcript', details: error.message }, { status: 500 });
  }
}
