import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { VirtualStudent } from '@/lib/types';

type RoomTabProps = {
  students: VirtualStudent[];
};

export default function RoomTab({ students }: RoomTabProps) {
  const getBadgeVariant = (status: VirtualStudent['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Struggling':
      case 'Confused':
        return 'destructive';
      case 'Curious':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="space-y-2">
      {students.map((student) => (
        <Card key={student.id} className="shadow-sm">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold">{student.name}</p>
            </div>
            <Badge variant={getBadgeVariant(student.status)}>{student.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
