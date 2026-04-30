'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import RoomTab from './room-tab';
import HistoryTab from './history-tab';
import AskQuestionForm from './ask-question-form';
import type { HistoryEvent, VirtualStudent } from '@/lib/types';

type ClassroomSidebarProps = {
  students: VirtualStudent[];
  history: HistoryEvent[];
  onAskQuestion: (question: string) => Promise<void> | void;
  askDisabled?: boolean;
};

export default function ClassroomSidebar({ students, history, onAskQuestion, askDisabled = false }: ClassroomSidebarProps) {
  return (
    <aside className="w-full md:w-[350px] lg:w-[400px] shrink-0 border-l bg-background/50 flex flex-col">
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="room" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-2">
            <TabsTrigger value="room">Room</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="room" className="flex-1 overflow-y-auto px-2">
            <RoomTab students={students} />
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-y-auto px-4">
            <HistoryTab history={history} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="border-t p-4">
        <AskQuestionForm onAskQuestion={onAskQuestion} disabled={askDisabled} />
      </div>
    </aside>
  );
}
