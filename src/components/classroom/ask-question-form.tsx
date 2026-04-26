'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

type AskQuestionFormProps = {
  onAskQuestion: (question: string) => void;
};

export default function AskQuestionForm({ onAskQuestion }: AskQuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    onAskQuestion(question);
    
    // Simulate network request
    setTimeout(() => {
        setQuestion('');
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="ask-question-input" className="font-semibold">Ask Teacher</Label>
      <div className="flex items-center gap-2">
        <Input
          id="ask-question-input"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" size="icon" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          <span className="sr-only">Submit question</span>
        </Button>
      </div>
    </form>
  );
}
