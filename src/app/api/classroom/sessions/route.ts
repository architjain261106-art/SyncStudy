import { getPastSessions } from '@/features/classroom/services/history';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sessions = await getPastSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('sessions API failed', error);
    return NextResponse.json({ error: 'Unable to fetch sessions.' }, { status: 500 });
  }
}
