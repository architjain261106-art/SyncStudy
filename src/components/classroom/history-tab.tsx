import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileQuestion, HelpCircle, User, Bot } from 'lucide-react';
import type { HistoryEvent } from '@/lib/types';

type HistoryTabProps = {
  history: HistoryEvent[];
};

const EventIcon = ({ type, author }: { type: HistoryEvent['type'], author: string }) => {
    const className = "h-4 w-4 text-primary-foreground";
    if (type === 'Quiz') return <FileQuestion className={className} />;
    if (type === 'Doubt') return <HelpCircle className={className} />;
    if (type === 'UserQuestion') return <User className={className} />;
    if (type === 'Info') return <Bot className={className} />;
    return <HelpCircle className={className} />;
}

export default function HistoryTab({ history }: HistoryTabProps) {
  if (history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <HelpCircle className="w-10 h-10 mb-4"/>
            <p className="font-semibold">No History Yet</p>
            <p className="text-sm">Doubts from students and your questions will appear here.</p>
        </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="relative border-l-2 border-primary/20 ml-3 py-4">
        {history.map((event) => (
          <div key={event.id} className="mb-6 pl-8 relative before:content-[''] before:absolute before:left-[-7px] before:top-2 before:h-3 before:w-3 before:rounded-full before:bg-primary">
            <div className="flex items-start gap-3">
               <Avatar className="h-8 w-8 mt-1">
                 {event.authorAvatar && <AvatarImage src={event.authorAvatar} alt={event.author} />}
                 <AvatarFallback>
                    <EventIcon type={event.type} author={event.author} />
                 </AvatarFallback>
               </Avatar>
               <div>
                  <div className="flex items-center gap-2 text-sm">
                      <p className="font-semibold">{event.author}</p>
                      <p className="text-muted-foreground">{event.timestamp}</p>
                  </div>
                  <p className="text-sm mt-1">{typeof event.content === 'string' ? event.content : 'Quiz initiated'}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
