# **App Name**: SyncStudy AI

## Core Features:

- Synchronized YouTube Lecture Playback: Embeds a YouTube IFrame player to stream lectures. Includes synchronized video control, header with branding, new session button, and a session timer.
- AI Classroom Intelligence & Analysis: Fetches and segments YouTube lecture transcripts. Utilizes an AI-driven 'Panic Engine' to calculate a Panic Factor (1-10) for virtual students based on topic difficulty. Features an 'AI Classroom Intelligence' status bar with an 'Auto-Pilot' toggle to manage AI interactions.
- Intelligent Virtual Student Interaction: AI-powered virtual students ask questions based on the lecture content. Before asking, the AI tool checks the 'doubts_history' collection in Firestore to avoid repetitive questions or generates a unique follow-up.
- Milestone Quiz Engine: Automatically generates and triggers 3-question Multiple Choice Quizzes (MCQs) as an overlay at major topic shifts within the lecture or every 10 minutes. Quiz results are stored in Firestore.
- User-Initiated Questioning (Ask Teacher): Allows users to 'Raise Hand' or type a question via a chat input. This sends the current video timestamp and the question to the backend and saves the AI-generated response to Firestore. User doubts are distinctly displayed in the 'History' tab.
- Dynamic Classroom Status Display: A tabbed sidebar on the right shows 'ROOM' (displaying virtual student cards with status labels like 'Struggling' or 'Curious' based on AI analysis) and 'HISTORY' (a vertical timeline of past doubts and quiz results).
- Robust Playback & AI Processing Protection: Implements anti-jitter mechanisms: debouncing AI analysis for 3 seconds if the user seeks or skips video playback, and preventing video pause/play during 'Buffering' states. Includes proper error handling for Genkit/Gemini AI calls to resolve potential issues.

## Style Guidelines:

- Primary action color: A professional and clean blue (#1E50B2) to evoke focus and clarity.
- Background color: A very light, almost white off-blue (#F7F9FA) for a clean, professional canvas.
- Accent color: A contrasting yet complementary cyan (#4CCCCE) for interactive elements and highlights, providing visual differentiation without overwhelming the blue/white theme.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, slightly technical feel suitable for titles and short bursts of information.
- Body font: 'Inter' (sans-serif) for its neutral, objective, and highly readable qualities, ideal for lecture transcripts, doubts, and quizzes.
- Utilize clean, educational-themed vector icons for clear navigation and status indicators, aligning with the professional and functional aesthetic.
- Employ a balanced two-column layout for the main dashboard: the YouTube player on the left, and a tabbed sidebar for classroom information on the right. A prominent, centered card for classroom joining on the landing page.
- Implement subtle and smooth transition animations for tab changes, quiz overlays, and status updates to enhance the user experience without distraction, reinforcing a polished and professional feel.