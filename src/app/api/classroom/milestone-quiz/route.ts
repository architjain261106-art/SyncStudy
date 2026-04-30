import {generateMilestoneQuiz} from '@/features/classroom/ai/milestone-quiz-generation';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const requestSchema = z.object({
  transcriptSegment: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: 'Invalid request payload.'}, {status: 400});
  }

  try {
    const response = await generateMilestoneQuiz(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('milestone-quiz API failed', error);
    return NextResponse.json({error: 'Unable to generate quiz right now.'}, {status: 500});
  }
}
