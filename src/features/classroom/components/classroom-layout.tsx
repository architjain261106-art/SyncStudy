'use client';

import {useEffect, useMemo, useRef, useState, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import type { HistoryEvent, Quiz, VirtualStudent } from '@/core/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatTime } from '@/lib/youtube';

import ClassroomHeader from './header';
import VideoPlayer from './video-player';
import ClassroomSidebar from './sidebar';
import QuizOverlay from './quiz-overlay';
import { useToast } from '@/hooks/use-toast';
import type {YouTubePlayer} from '@/lib/youtube-player';

const studentAvatars = PlaceHolderImages.filter(p => p.id.startsWith('student'));
const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
const ROOM_STORAGE_VERSION = 1;

const initialStudents: VirtualStudent[] = [
  { id: 'student-a', name: 'Student A', avatar: studentAvatars[0]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
  { id: 'student-b', name: 'Student B', avatar: studentAvatars[1]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
  { id: 'student-c', name: 'Student C', avatar: studentAvatars[2]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
];

type PersistedRoomState = {
  version: number;
  students: VirtualStudent[];
  history: HistoryEvent[];
  isAutoPilot: boolean;
};

const aiStatusPalette: Array<Pick<VirtualStudent, 'status' | 'statusColor'>> = [
  {status: 'Engaged', statusColor: 'bg-green-500'},
  {status: 'Curious', statusColor: 'bg-yellow-500'},
  {status: 'Thinking', statusColor: 'bg-blue-500'},
  {status: 'Struggling', statusColor: 'bg-orange-500'},
  {status: 'Confused', statusColor: 'bg-red-500'},
];

function chooseStatusByPanic(panicFactor: number, studentIndex: number): Pick<VirtualStudent, 'status' | 'statusColor'> {
  // Add some personality based on studentIndex
  // Student 0: Tends to be more engaged (-1 panic)
  // Student 1: Average (0 panic)
  // Student 2: Tends to struggle easily (+1 panic)
  const studentModifiers = [-1, 0, 1];
  const modifier = studentModifiers[studentIndex % studentModifiers.length];
  
  // Random variance (-0.5 to +0.5) so they don't always sync perfectly
  const randomVariance = (Math.random() - 0.5);
  
  const effectiveScore = Math.max(1, Math.min(10, panicFactor + modifier + randomVariance));

  if (effectiveScore <= 3.5) return aiStatusPalette[0]; // Engaged
  if (effectiveScore <= 5.5) return aiStatusPalette[1]; // Curious
  if (effectiveScore <= 7.0) return aiStatusPalette[2]; // Thinking
  if (effectiveScore <= 8.5) return aiStatusPalette[3]; // Struggling
  return aiStatusPalette[4]; // Confused
}

type TranscriptEntry = {
  text: string;
  duration: number;
  offset: number;
  lang: string;
};

function buildLectureContext(transcript: TranscriptEntry[], currentTimeInSeconds: number, history: HistoryEvent[]): string {
  let context = "";
  if (transcript && transcript.length > 0) {
    const currentTimeMs = currentTimeInSeconds * 1000;
    const startTimeMs = Math.max(0, currentTimeMs - 120000);
    const endTimeMs = currentTimeMs + 30000;
    
    const relevantEntries = transcript.filter(entry => {
      const entryStart = entry.offset;
      const entryEnd = entry.offset + entry.duration;
      return (entryStart <= endTimeMs && entryEnd >= startTimeMs);
    });
    
    if (relevantEntries.length > 0) {
      context += "Transcript:\n" + relevantEntries.map(e => e.text).join(' ') + "\n\n";
    }
  }

  const recent = history.slice(0, 8).reverse();
  if (recent.length > 0) {
    context += "Recent Chat:\n" + recent
      .map((event) => `[${event.timestamp}] ${event.author}: ${typeof event.content === 'string' ? event.content : 'Quiz interaction'}`)
      .join('\n');
  }

  if (!context) {
    return 'Lecture transcript is not available yet. Use the current topic and nearby context to answer clearly.';
  }
  return context;
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({} as {error?: string}));
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<TResponse>;
}

export default function ClassroomLayout({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const storageKey = useMemo(() => `syncstudy-room:${videoId}`, [videoId]);

  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [students, setStudents] = useState<VirtualStudent[]>(initialStudents);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  const historyRef = useRef(history);
  const studentsRef = useRef(students);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    historyRef.current = history;
    studentsRef.current = students;
    transcriptRef.current = transcript;
  }, [history, students, transcript]);

  useEffect(() => {
    fetch(`/api/classroom/transcript?videoId=${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.transcript) setTranscript(data.transcript);
      })
      .catch(console.error);
  }, [videoId]);

  const addHistoryEvent = useCallback((event: HistoryEvent) => {
    const eventWithVideoId = { ...event, videoId };
    setHistory(prev => [eventWithVideoId, ...prev]);
    postJson('/api/classroom/history', { event: eventWithVideoId }).catch(console.error);
  }, [videoId]);
  
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const isAiProcessing = useRef(false);
  const aiIntervals = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const persisted = localStorage.getItem(storageKey);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as PersistedRoomState;
        if (parsed.version === ROOM_STORAGE_VERSION) {
          setStudents(parsed.students.length > 0 ? parsed.students : initialStudents);
          setIsAutoPilot(parsed.isAutoPilot);
        }
      } catch (error) {
        console.error('Failed to parse persisted classroom state', error);
        localStorage.removeItem(storageKey);
      }
    }

    // Fetch history from IBM Cloudant API
    fetch(`/api/classroom/history?videoId=${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
        }
      })
      .catch(console.error);

  }, [storageKey, videoId]);

  useEffect(() => {
    const payload: PersistedRoomState = {
      version: ROOM_STORAGE_VERSION,
      students,
      history,
      isAutoPilot,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [history, isAutoPilot, storageKey, students]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSessionActive) {
      timer = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);
  
  useEffect(() => {
    if (isAutoPilot && isSessionActive) {
      const statusInterval = setInterval(async () => {
        const currentHistory = historyRef.current;
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        
        // If the video just started, keep everyone engaged rather than judging difficulty early
        if (currentTime < 60) {
          setStudents((prev) =>
            prev.map((student) => ({
              ...student,
              status: 'Engaged',
              statusColor: 'bg-green-500'
            }))
          );
          return;
        }

        const lectureContext = buildLectureContext(transcriptRef.current, currentTime, currentHistory);
        const recentDoubts = currentHistory
          .filter((entry) => entry.type === 'Doubt' || entry.type === 'UserQuestion')
          .slice(0, 5)
          .map((entry) => String(entry.content));
        try {
          const result = await postJson<{panicFactor: number}>('/api/classroom/lecture-difficulty', {
            lectureTranscript: lectureContext,
            currentTopic: `YouTube lesson ${videoId}`,
            recentDoubts,
          });
          setStudents((prev) =>
            prev.map((student, index) => ({
              ...student,
              ...chooseStatusByPanic(result.panicFactor, index),
            }))
          );
        } catch (error) {
          console.error('Difficulty analysis failed', error);
        }
      }, 45000);

      const questionInterval = setInterval(async () => {
        const currentHistory = historyRef.current;
        const currentStudents = studentsRef.current;
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        const lectureContext = buildLectureContext(transcriptRef.current, currentTime, currentHistory);
        const timestamp = formatTime(currentTime);
        const recentDoubtsHistory = currentHistory
          .filter((entry) => entry.type === 'Doubt')
          .slice(0, 6)
          .map((entry) => String(entry.content));
        try {
          const result = await postJson<{question: string}>('/api/classroom/virtual-question', {
            transcriptSegment: lectureContext,
            currentTimestamp: timestamp,
            recentDoubtsHistory,
            lectureTopic: `YouTube lesson ${videoId}`,
          });
          const student = currentStudents[Math.floor(Math.random() * currentStudents.length)] ?? initialStudents[0];
          const newDoubt: HistoryEvent = {
            id: `doubt-${Date.now()}`,
            type: 'Doubt',
            author: student.name,
            authorAvatar: student.avatar,
            content: result.question,
            timestamp,
          };
          addHistoryEvent(newDoubt);
          toast({title: `New doubt from ${student.name}`, description: result.question});
          
          // Generate a response from the AI teacher for the virtual student's doubt
          setTimeout(async () => {
            try {
              const answerResult = await postJson<{answer: string}>('/api/classroom/ask-question', {
                question: result.question,
                lectureContext,
                timestamp,
              });
              const newAnswer: HistoryEvent = {
                  id: `ai-ans-${Date.now()}`,
                  type: 'Info',
                  author: 'AI Assistant',
                  content: answerResult.answer,
                  timestamp,
              };
              addHistoryEvent(newAnswer);
            } catch (answerError) {
              console.error('Failed to answer virtual student doubt', answerError);
            }
          }, 2500);
        } catch (error) {
          console.error('Virtual question generation failed', error);
        }
      }, 75000);

      const quizInterval = setInterval(() => {
        void handleQuizTrigger();
      }, 10 * 60 * 1000);

      aiIntervals.current = [statusInterval, questionInterval, quizInterval];
    } else {
      aiIntervals.current.forEach(clearInterval);
      aiIntervals.current = [];
    }

    return () => {
      aiIntervals.current.forEach(clearInterval);
    };
  }, [isAutoPilot, isSessionActive, toast, videoId]);

  const handlePlayerReady = useCallback((player: YouTubePlayer) => {
    playerRef.current = player;
    player.mute();
    player.playVideo();
  }, []);

  const handlePlayerStateChange = useCallback((isPlaying: boolean) => {
    if (isAiProcessing.current && !isPlaying) {
      setIsSessionActive(false);
      return;
    }
    setIsSessionActive(isPlaying);
  }, []);
  
  const handleAskQuestion = async (question: string) => {
    setIsAskingQuestion(true);
    const timestamp = formatTime(playerRef.current?.getCurrentTime() || 0);
    const newQuestion: HistoryEvent = {
        id: `user-q-${Date.now()}`,
        type: 'UserQuestion',
        author: 'You',
        authorAvatar: userAvatar?.imageUrl,
        content: question,
        timestamp,
    };
    addHistoryEvent(newQuestion);

    try {
      const currentTime = playerRef.current?.getCurrentTime() || 0;
      const lectureContext = buildLectureContext(transcriptRef.current, currentTime, history);
      const result = await postJson<{answer: string}>('/api/classroom/ask-question', {
        question,
        lectureContext,
        timestamp,
      });
        const newAnswer: HistoryEvent = {
            id: `ai-ans-${Date.now()}`,
            type: 'Info',
            author: 'AI Assistant',
            authorAvatar: undefined,
            content: result.answer,
            timestamp,
        };
        addHistoryEvent(newAnswer);
        toast({ title: 'AI Assistant has answered', description: result.answer });
    } catch (error) {
      console.error('Question answering failed', error);
      toast({
        title: 'Unable to answer right now',
        description: 'Please try asking again in a few seconds.',
        variant: 'destructive',
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleQuizTrigger = async () => {
    if (isGeneratingQuiz) return;
    setIsGeneratingQuiz(true);
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    const lectureContext = buildLectureContext(transcriptRef.current, currentTime, history);

    try {
      const quiz = await postJson<Quiz>('/api/classroom/milestone-quiz', {
        transcriptSegment: lectureContext,
      });
      isAiProcessing.current = true;
      playerRef.current?.pauseVideo();
      setCurrentQuiz(quiz);
      setIsQuizVisible(true);
      const quizEvent: HistoryEvent = {
        id: `quiz-${Date.now()}`,
        type: 'Quiz',
        author: 'System',
        content: 'A milestone quiz was initiated.',
        timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
      };
      addHistoryEvent(quizEvent);
      toast({title: 'Quiz Time!', description: "Let's test your knowledge."});
    } catch (error) {
      console.error('Quiz generation failed', error);
      toast({
        title: 'Unable to generate quiz',
        description: 'AI quiz generation failed. Playback will continue.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }

  };
  
  const handleQuizSubmit = (score: number, total: number) => {
    setIsQuizVisible(false);
    setCurrentQuiz(null);
    
    isAiProcessing.current = false;
    setTimeout(() => {
        playerRef.current?.playVideo();
    }, 500);

    toast({
      title: 'Quiz Complete!',
      description: `You scored ${score} out of ${total}.`,
    });
    const resultEvent: HistoryEvent = {
        id: `quiz-result-${Date.now()}`,
        type: 'Info',
        author: 'System',
        content: `Quiz completed with score: ${score}/${total}.`,
        timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
    };
    addHistoryEvent(resultEvent);
  };

  const handleNewSession = () => {
      router.push('/');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background font-body">
      <ClassroomHeader
        sessionTime={sessionTime}
        onNewSession={handleNewSession}
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-4 overflow-y-auto">
          <VideoPlayer 
            videoId={videoId} 
            isAutoPilot={isAutoPilot}
            onAutoPilotChange={setIsAutoPilot}
            onReady={handlePlayerReady}
            onStateChange={handlePlayerStateChange}
          />
        </div>
        <ClassroomSidebar
          students={students}
          history={history}
          onAskQuestion={handleAskQuestion}
          askDisabled={isAskingQuestion || isGeneratingQuiz}
        />
      </main>
      {isQuizVisible && currentQuiz && (
        <QuizOverlay
          quiz={currentQuiz}
          onSubmit={handleQuizSubmit}
        />
      )}
    </div>
  );
}
