'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating relevant and non-repetitive questions
 * from AI-powered virtual students based on a given lecture transcript segment and past questions.
 *
 * - virtualStudentQuestionGeneration - A function to generate a virtual student's question.
 * - VirtualStudentQuestionGenerationInput - The input type for the virtualStudentQuestionGeneration function.
 * - VirtualStudentQuestionGenerationOutput - The return type for the virtualStudentQuestionGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualStudentQuestionGenerationInputSchema = z.object({
  transcriptSegment: z.string().describe('The current segment of the lecture transcript.'),
  currentTimestamp: z.string().describe('The current timestamp in the video (e.g., "00:05:30").'),
  recentDoubtsHistory: z.array(z.string()).describe('A list of recent questions asked by virtual students to avoid repetition. If no recent doubts, provide an empty array.'),
  lectureTopic: z.string().optional().describe('The main topic or title of the lecture for additional context.'),
});
export type VirtualStudentQuestionGenerationInput = z.infer<typeof VirtualStudentQuestionGenerationInputSchema>;

const VirtualStudentQuestionGenerationOutputSchema = z.object({
  question: z.string().describe('A relevant and non-repetitive question a virtual student might ask based on the lecture content.'),
});
export type VirtualStudentQuestionGenerationOutput = z.infer<typeof VirtualStudentQuestionGenerationOutputSchema>;

const virtualStudentQuestionGenerationPrompt = ai.definePrompt({
  name: 'virtualStudentQuestionGenerationPrompt',
  input: {schema: VirtualStudentQuestionGenerationInputSchema},
  output: {schema: VirtualStudentQuestionGenerationOutputSchema},
  prompt: `You are a virtual student attending an online lecture. Your goal is to ask a relevant and insightful question about the current lecture content.
  
  **Instructions:**
  1.  Review the "Current Lecture Segment" carefully.
  2.  Consider the "Recent Questions Already Asked" to ensure your question is original and not a direct repetition.
  3.  If a very similar question has already been asked, try to ask a follow-up question that builds on the previous one, or ask a question about a related but distinct concept from the current segment. Do not simply rephrase an existing question.
  4.  Focus on points that might be confusing, require clarification, or lead to a deeper understanding for a typical student.
  5.  Your response must be a single, clear question.

  ---
  
  **Current Lecture Segment (at timestamp {{{currentTimestamp}}}):**
  {{{transcriptSegment}}}
  
  {{#if lectureTopic}}
  **Lecture Topic:** {{{lectureTopic}}}
  {{/if}}
  
  **Recent Questions Already Asked:**
  {{#if recentDoubtsHistory}}
  {{#each recentDoubtsHistory}}
  - {{{this}}}
  {{/each}}
  {{else}}
  No recent questions.
  {{/if}}
  
  ---
  
  Your question:`,
});

const virtualStudentQuestionGenerationFlow = ai.defineFlow(
  {
    name: 'virtualStudentQuestionGenerationFlow',
    inputSchema: VirtualStudentQuestionGenerationInputSchema,
    outputSchema: VirtualStudentQuestionGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await virtualStudentQuestionGenerationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate virtual student question.');
    }
    return output;
  }
);

export async function virtualStudentQuestionGeneration(
  input: VirtualStudentQuestionGenerationInput
): Promise<VirtualStudentQuestionGenerationOutput> {
  return virtualStudentQuestionGenerationFlow(input);
}
