'use server';
/**
 * @fileOverview A Genkit flow for handling user questions about lecture content.
 *
 * - askQuestion - A function that allows a user to ask a question and get an AI-generated answer.
 * - UserQuestionAnsweringInput - The input type for the askQuestion function.
 * - UserQuestionAnsweringOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Define Input Schema
const UserQuestionAnsweringInputSchema = z.object({
  question: z.string().describe("The user's question about the lecture content."),
  lectureContext:
    z.string().describe('Relevant text snippet from the lecture transcript providing context for the question.'),
  timestamp:
    z.string()
      .optional()
      .describe(
        'The timestamp in the video (e.g., "05:30" or "330") where the user asked the question.'
      ),
});
export type UserQuestionAnsweringInput = z.infer<
  typeof UserQuestionAnsweringInputSchema
>;

// 2. Define Output Schema
const UserQuestionAnsweringOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type UserQuestionAnsweringOutput = z.infer<
  typeof UserQuestionAnsweringOutputSchema
>;

// 3. Define the Prompt
const userQuestionAnsweringPrompt = ai.definePrompt({
  name: 'userQuestionAnsweringPrompt',
  input: {schema: UserQuestionAnsweringInputSchema},
  output: {schema: UserQuestionAnsweringOutputSchema},
  prompt: `You are a helpful and knowledgeable teaching assistant for a virtual classroom.
Your task is to answer a student's question based on the provided lecture context.
Be concise, clear, and directly address the question using the information available in the context.
If the question cannot be answered from the provided context, use your general knowledge about the topic to provide a helpful answer, but still relate it back to the general subject of the lecture if possible.

Lecture Context (from {{timestamp}} if provided):
"""
{{{lectureContext}}}
"""

Student's Question: "{{{question}}}"`,
});

// 4. Define the Flow
const userQuestionAnsweringFlow = ai.defineFlow(
  {
    name: 'userQuestionAnsweringFlow',
    inputSchema: UserQuestionAnsweringInputSchema,
    outputSchema: UserQuestionAnsweringOutputSchema,
  },
  async input => {
    const {output} = await userQuestionAnsweringPrompt(input);
    if (!output) {
      throw new Error('Failed to generate an answer for the user question.');
    }
    return output;
  }
);

// 5. Export the wrapper function
export async function askQuestion(
  input: UserQuestionAnsweringInput
): Promise<UserQuestionAnsweringOutput> {
  return userQuestionAnsweringFlow(input);
}
