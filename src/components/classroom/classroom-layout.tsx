'use client';

import { useState, useEffect, useRef } from 'react';
import type { HistoryEvent, Quiz, VirtualStudent } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatTime, getYoutubeVideoId } from '@/lib/youtube';

import ClassroomHeader from './header';
import VideoPlayer from './video-player';
import ClassroomSidebar from './sidebar';
import QuizOverlay from './quiz-overlay';
import { useToast } from '@/hooks/use-toast';

const studentAvatars = PlaceHolderImages.filter(p => p.id.startsWith('student'));
const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

const initialStudents: VirtualStudent[] = [
  { id: 'student-a', name: 'Student A', avatar: studentAvatars[0]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
  { id: 'student-b', name: 'Student B', avatar: studentAvatars[1]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
  { id: 'student-c', name: 'Student C', avatar: studentAvatars[2]?.imageUrl || '', status: 'Engaged', statusColor: 'bg-green-500' },
];

const studentStatuses: Pick<VirtualStudent, 'status' | 'statusColor'>[] = [
    { status: 'Engaged', statusColor: 'bg-green-500'},
    { status: 'Curious', statusColor: 'bg-yellow-500'},
    { status: 'Struggling', statusColor: 'bg-orange-500'},
    { status: 'Confused', statusColor: 'bg-red-500'},
];

const sampleQuiz: Quiz = {
  questions: [
    { questionText: "What is the main topic of the first section?", options: ["Topic A", "Topic B", "Topic C"], correctAnswer: "Topic A" },
    { questionText: "Which concept was described as 'foundational'?", options: ["Concept X", "Concept Y", "Concept Z"], correctAnswer: "Concept Y" },
    { questionText: "What was the year the study was published?", options: ["1990", "2005", "2021"], correctAnswer: "2005" },
  ]
};

export default function ClassroomLayout({ youtubeUrl }: { youtubeUrl: string }) {
  const { toast } = useToast();
  const videoId = getYoutubeVideoId(youtubeUrl);

  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [students, setStudents] = useState<VirtualStudent[]>(initialStudents);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const playerRef = useRef<any>(null);
  
  const simulationIntervals = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSessionActive) {
      timer = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            setSessionTime(playerRef.current.getCurrentTime());
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);
  
  useEffect(() => {
    if (isAutoPilot && isSessionActive) {
      // Simulate student status change
      const statusInterval = setInterval(() => {
        setStudents(prev => prev.map(s => ({
          ...s,
          ...studentStatuses[Math.floor(Math.random() * studentStatuses.length)]
        })));
      }, 25000); // every 25 seconds

      // Simulate student question
      const questionInterval = setInterval(() => {
        const student = initialStudents[Math.floor(Math.random() * initialStudents.length)];
        const newDoubt: HistoryEvent = {
          id: `doubt-${Date.now()}`,
          type: 'Doubt',
          author: student.name,
          authorAvatar: student.avatar,
          content: 'This is a simulated question. Can you elaborate on the previous point?',
          timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
        };
        setHistory(prev => [newDoubt, ...prev]);
        toast({ title: `New doubt from ${student.name}`, description: newDoubt.content as string });
      }, 45000); // every 45 seconds

      // Simulate quiz trigger
      const quizInterval = setInterval(() => {
        handleQuizTrigger();
      }, 10 * 60 * 1000); // every 10 minutes

      simulationIntervals.current = [statusInterval, questionInterval, quizInterval];
    } else {
      simulationIntervals.current.forEach(clearInterval);
      simulationIntervals.current = [];
    }

    return () => {
      simulationIntervals.current.forEach(clearInterval);
    };
  }, [isAutoPilot, isSessionActive]);

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
    player.playVideo();
  };

  const handlePlayerStateChange = (isPlaying: boolean) => {
    setIsSessionActive(isPlaying);
  };
  
  const handleAskQuestion = (question: string) => {
    const newQuestion: HistoryEvent = {
        id: `user-q-${Date.now()}`,
        type: 'UserQuestion',
        author: 'You',
        authorAvatar: userAvatar?.imageUrl,
        content: question,
        timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
    };
    setHistory(prev => [newQuestion, ...prev]);

    // Simulate AI answer
    setTimeout(() => {
        const newAnswer: HistoryEvent = {
            id: `ai-ans-${Date.now()}`,
            type: 'Info',
            author: 'AI Assistant',
            authorAvatar: undefined,
            content: `This is an AI-generated answer to your question: "${question}". The answer is based on the lecture content.`,
            timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
        };
        setHistory(prev => [newAnswer, ...prev]);
        toast({ title: 'AI Assistant has answered', description: newAnswer.content as string });
    }, 2000);
  };

  const handleQuizTrigger = () => {
    playerRef.current?.pauseVideo();
    setCurrentQuiz(sampleQuiz);
    setIsQuizVisible(true);
    const quizEvent: HistoryEvent = {
      id: `quiz-${Date.now()}`,
      type: 'Quiz',
      author: 'System',
      content: 'A milestone quiz was initiated.',
      timestamp: formatTime(playerRef.current?.getCurrentTime() || 0),
    };
    setHistory(prev => [quizEvent, ...prev]);
    toast({ title: "Quiz Time!", description: "Let's test your knowledge." });
  };
  
  const handleQuizSubmit = (score: number, total: number) => {
    setIsQuizVisible(false);
    setCurrentQuiz(null);
    playerRef.current?.playVideo();
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
    setHistory(prev => [resultEvent, ...prev]);
  };

  const handleNewSession = () => {
      window.location.href = '/';
  };

  if (!videoId) {
    return <div>Error: Invalid YouTube URL.</div>;
  }

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
