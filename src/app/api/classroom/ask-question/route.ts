import {askQuestion} from '@/ai/flows/user-question-answering';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const requestSchema = z.object({
  question: z.string().min(1),
  lectureContext: z.string().min(1),
  timestamp: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: 'Invalid request payload.'}, {status: 400});
  }

  try {
    const response = await askQuestion(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('ask-question API failed', error);
    return NextResponse.json({error: 'Unable to answer question right now.'}, {status: 500});
  }
}
