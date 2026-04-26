'use server';
/**
 * @fileOverview A Genkit flow for generating multiple-choice quizzes based on lecture transcript segments.
 *
 * - generateMilestoneQuiz - A function that generates a 3-question multiple-choice quiz.
 * - MilestoneQuizGenerationInput - The input type for the generateMilestoneQuiz function.
 * - MilestoneQuizGenerationOutput - The return type for the generateMilestoneQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MilestoneQuizGenerationInputSchema = z.object({
  transcriptSegment: z
    .string()
    .describe(
      'A segment of the lecture transcript from which to generate quiz questions.'
    ),
});
export type MilestoneQuizGenerationInput = z.infer<
  typeof MilestoneQuizGenerationInputSchema
>;

const MilestoneQuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options:
    z.array(z.string()).min(2).max(4).describe('An array of possible answers for the question.'),
  correctAnswer:
    z.string().describe('The correct answer from the provided options.'),
  explanation:
    z.string().optional().describe('An optional explanation for the correct answer.'),
});

const MilestoneQuizGenerationOutputSchema = z.object({
  questions:
    z.array(MilestoneQuizQuestionSchema).min(3).max(3).describe('An array of 3 multiple-choice questions.'),
});
export type MilestoneQuizGenerationOutput = z.infer<
  typeof MilestoneQuizGenerationOutputSchema
>;

export async function generateMilestoneQuiz(
  input: MilestoneQuizGenerationInput
): Promise<MilestoneQuizGenerationOutput> {
  return milestoneQuizGenerationFlow(input);
}

const milestoneQuizPrompt = ai.definePrompt({
  name: 'milestoneQuizPrompt',
  input: { schema: MilestoneQuizGenerationInputSchema },
  output: { schema: MilestoneQuizGenerationOutputSchema },
  prompt: `You are an intelligent quiz master. Your task is to generate exactly 3 multiple-choice questions based on the provided lecture transcript segment. Each question should have 2 to 4 options, and one correct answer. Provide an explanation for why the answer is correct. Ensure the questions test understanding of key concepts from the segment. The output must be valid JSON matching the provided schema.

Lecture Segment:
{{{transcriptSegment}}}`,
});

const milestoneQuizGenerationFlow = ai.defineFlow(
  {
    name: 'milestoneQuizGenerationFlow',
    inputSchema: MilestoneQuizGenerationInputSchema,
    outputSchema: MilestoneQuizGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await milestoneQuizPrompt(input);
    return output!;
  }
);
