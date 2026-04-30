'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing lecture content
 * to determine topic difficulty and engagement for virtual students.
 *
 * - analyzeLectureDifficulty - A function that handles the lecture difficulty analysis process.
 * - LectureDifficultyAnalysisInput - The input type for the analyzeLectureDifficulty function.
 * - LectureDifficultyAnalysisOutput - The return type for the analyzeLectureDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LectureDifficultyAnalysisInputSchema = z.object({
  lectureTranscript: z
    .string()
    .describe('The full transcript of the lecture content being analyzed.'),
  currentTopic: z
    .string()
    .describe(
      'The specific topic currently being discussed within the lecture.'
    ),
  recentDoubts: z
    .array(z.string())
    .describe(
      'A list of recent questions or doubts raised by students, indicating areas of confusion.'
    ),
});
export type LectureDifficultyAnalysisInput = z.infer<
  typeof LectureDifficultyAnalysisInputSchema
>;

const LectureDifficultyAnalysisOutputSchema = z.object({
  panicFactor: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'A score from 1 (very easy) to 10 (very challenging) indicating the estimated difficulty for virtual students.'
    ),
  difficultyReason: z
    .string()
    .describe(
      'A brief explanation for the determined panic factor and perceived difficulty.'
    ),
  suggestedEngagement: z
    .string()
    .describe(
      'A suggestion for how virtual students might engage with this content (e.g., "Review this section," "Great for discussion," "Pay close attention to examples").'
    ),
});
export type LectureDifficultyAnalysisOutput = z.infer<
  typeof LectureDifficultyAnalysisOutputSchema
>;

export async function analyzeLectureDifficulty(
  input: LectureDifficultyAnalysisInput
): Promise<LectureDifficultyAnalysisOutput> {
  return lectureDifficultyAnalysisFlow(input);
}

const lectureDifficultyAnalysisPrompt = ai.definePrompt({
  name: 'lectureDifficultyAnalysisPrompt',
  input: {schema: LectureDifficultyAnalysisInputSchema},
  output: {schema: LectureDifficultyAnalysisOutputSchema},
  prompt: `You are an AI Classroom Intelligence system designed to assess the difficulty of lecture content for virtual students.
Your task is to analyze the provided lecture transcript, current topic, and recent student doubts to determine a 'panic factor' (difficulty score).

Based on the information, provide:
1. A 'panicFactor' (a number from 1 to 10, where 1 is very easy and 10 is very challenging).
2. A 'difficultyReason' explaining why you assigned that panic factor.
3. A 'suggestedEngagement' for virtual students regarding this specific content.

Lecture Transcript Context:
"""{{{lectureTranscript}}}"""

Current Topic: {{{currentTopic}}}

Recent Student Doubts (if any):
{{#if recentDoubts}}
  {{#each recentDoubts}}
    - {{{this}}}
  {{/each}}
{{else}}
  No recent doubts.
{{/if}}

Consider the complexity of vocabulary, conceptual density, potential for misconceptions, and how recent doubts might indicate challenging areas. Focus your analysis on the 'currentTopic' within the broader transcript.
`,
});

const lectureDifficultyAnalysisFlow = ai.defineFlow(
  {
    name: 'lectureDifficultyAnalysisFlow',
    inputSchema: LectureDifficultyAnalysisInputSchema,
    outputSchema: LectureDifficultyAnalysisOutputSchema,
  },
  async input => {
    const {output} = await lectureDifficultyAnalysisPrompt(input);
    return output!;
  }
);
