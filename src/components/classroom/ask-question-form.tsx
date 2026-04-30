'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

type AskQuestionFormProps = {
  onAskQuestion: (question: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function AskQuestionForm({ onAskQuestion, disabled = false }: AskQuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    Promise.resolve(onAskQuestion(question.trim())).finally(() => {
        setQuestion('');
        setIsSubmitting(false);
    });
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
           disabled={isSubmitting || disabled}
         />
         <Button type="submit" size="icon" disabled={isSubmitting || disabled}>
           {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
           <span className="sr-only">Submit question</span>
         </Button>
      </div>
    </form>
  );
}
