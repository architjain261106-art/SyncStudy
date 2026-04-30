import Link from 'next/link';
import { Timer, PlusSquare } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { formatTime } from '@/lib/youtube';

type ClassroomHeaderProps = {
  sessionTime: number;
  onNewSession: () => void;
};

export default function ClassroomHeader({ sessionTime, onNewSession }: ClassroomHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <Link href="/" className="font-headline text-2xl font-bold text-primary">
        SyncStudy AI
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Timer className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Session Time:</span>
          <span className="font-mono text-base">{formatTime(sessionTime)}</span>
        </div>
        <Button onClick={onNewSession} variant="outline">
          <PlusSquare className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>
    </header>
  );
}
