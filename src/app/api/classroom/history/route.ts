import { getHistoryEvents, saveHistoryEvent } from '@/features/classroom/services/history';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId') || undefined;

  try {
    const history = await getHistoryEvents(videoId);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('history API failed', error);
    return NextResponse.json({ error: 'Unable to fetch history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.event || !body.event.id) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }
    
    await saveHistoryEvent(body.event);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('save history API failed', error);
    return NextResponse.json({ error: 'Unable to save history.' }, { status: 500 });
  }
}
