export type VirtualStudent = {
  id: string;
  name: string;
  avatar: string;
  status: 'Engaged' | 'Curious' | 'Thinking' | 'Struggling' | 'Confused';
  statusColor: 'bg-green-500' | 'bg-yellow-500' | 'bg-blue-500' | 'bg-orange-500' | 'bg-red-500';
};

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type Quiz = {
  questions: QuizQuestion[];
};

export type HistoryEvent = {
  id: string;
  type: 'Doubt' | 'Quiz' | 'UserQuestion' | 'Info';
  author: string;
  authorAvatar?: string;
  content: string | Quiz;
  timestamp: string;
};
