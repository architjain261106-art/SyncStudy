import {analyzeLectureDifficulty} from '@/features/classroom/ai/lecture-difficulty-analysis-flow';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const requestSchema = z.object({
  lectureTranscript: z.string().min(1),
  currentTopic: z.string().min(1),
  recentDoubts: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: 'Invalid request payload.'}, {status: 400});
  }

  try {
    const response = await analyzeLectureDifficulty(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('lecture-difficulty API failed', error);
    return NextResponse.json({error: 'Unable to analyze lecture difficulty right now.'}, {status: 500});
  }
}
