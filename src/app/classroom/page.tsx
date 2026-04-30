import ClassroomLayout from '@/components/classroom/classroom-layout';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

function ClassroomPageContent({ videoId }: { videoId: string | undefined }) {
  if (!videoId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center">
            <CardContent className="p-6">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold font-headline mb-2">No Video Provided</h1>
                <p className="text-muted-foreground mb-4">A valid YouTube video is required to start a session.</p>
                <Button asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h1 className="text-xl font-bold font-headline mb-2">Invalid Video ID</h1>
            <p className="text-muted-foreground mb-4">The provided video identifier is not valid.</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ClassroomLayout videoId={videoId} />;
}

export default function ClassroomPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const videoId = searchParams?.videoId as string | undefined;

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background">Loading Classroom...</div>}>
      <ClassroomPageContent videoId={videoId} />
    </Suspense>
  );
}
