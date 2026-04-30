import {virtualStudentQuestionGeneration} from '@/features/classroom/ai/virtual-student-question-generation';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const requestSchema = z.object({
  transcriptSegment: z.string().min(1),
  currentTimestamp: z.string().min(1),
  recentDoubtsHistory: z.array(z.string()),
  lectureTopic: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({error: 'Invalid request payload.'}, {status: 400});
  }

  try {
    const response = await virtualStudentQuestionGeneration(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('virtual-question API failed', error);
    return NextResponse.json({error: 'Unable to generate a virtual question right now.'}, {status: 500});
  }
}
