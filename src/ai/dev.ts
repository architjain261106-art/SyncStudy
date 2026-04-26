import { config } from 'dotenv';
config();

import '@/ai/flows/lecture-difficulty-analysis-flow.ts';
import '@/ai/flows/milestone-quiz-generation.ts';
import '@/ai/flows/user-question-answering.ts';
import '@/ai/flows/virtual-student-question-generation.ts';