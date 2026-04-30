'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/core/ui/dialog';
import { Button } from '@/core/ui/button';
import { RadioGroup, RadioGroupItem } from '@/core/ui/radio-group';
import { Label } from '@/core/ui/label';
import { Card, CardContent } from '@/core/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Quiz } from '@/core/types';

type QuizOverlayProps = {
  quiz: Quiz;
  onSubmit: (score: number, total: number) => void;
};

export default function QuizOverlay({ quiz, onSubmit }: QuizOverlayProps) {
  const [answers, setAnswers] = useState<string[]>(Array(quiz.questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const handleClose = () => {
    onSubmit(score, quiz.questions.length);
  };

  return (
    <Dialog open={true} onOpenChange={ (open) => { if (!open && submitted) handleClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Milestone Quiz</DialogTitle>
          {!submitted && <DialogDescription>Let's check your understanding of the recent topics.</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
          {quiz.questions.map((q, qIndex) => (
            <Card key={qIndex}>
              <CardContent className="p-4">
                <p className="font-semibold mb-4">{qIndex + 1}. {q.questionText}</p>
                <RadioGroup
                  value={answers[qIndex]}
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  disabled={submitted}
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {submitted && (
                    <div className={`mt-3 p-2 rounded-md text-sm flex items-center gap-2 ${
                        answers[qIndex] === q.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {answers[qIndex] === q.correctAnswer ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                        Correct answer: {q.correctAnswer}
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          {submitted ? (
             <div className='w-full flex justify-between items-center'>
                <p className="font-bold text-lg">Your Score: {score} / {quiz.questions.length}</p>
                <Button onClick={handleClose}>Continue Lecture</Button>
            </div>
          ) : (
            <Button onClick={handleSubmit} disabled={answers.some(a => a === '')}>Submit Quiz</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
