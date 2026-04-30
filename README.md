# SyncStudy AI

SyncStudy AI is a Next.js classroom experience for YouTube lectures with AI-powered question answering, virtual student doubts, milestone quizzes, and difficulty analysis.

## Prerequisites

- Node.js 20+
- npm
- A Gemini API key

## Environment setup

Create `.env.local` in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

`GEMINI_API_KEY` is also supported.

## Run locally

```bash
npm install
npm run dev
```

App runs on `http://localhost:9002`.

## Scripts

- `npm run dev` — start local app
- `npm run build` — production build (cross-platform)
- `npm run start` — run production build
- `npm run lint` — run Next lint
- `npm run typecheck` — run TypeScript checks
- `npm run test` — run unit tests (Vitest)

## API endpoints

- `POST /api/classroom/ask-question`
- `POST /api/classroom/virtual-question`
- `POST /api/classroom/milestone-quiz`
- `POST /api/classroom/lecture-difficulty`

These route handlers call Genkit flows in `src/ai/flows`.

## Notes

- Classroom route now accepts a validated `videoId` query parameter.
- Session history/student state/autopilot mode are persisted in localStorage per video.
- Default Genkit model is `googleai/gemini-2.5-pro`.
