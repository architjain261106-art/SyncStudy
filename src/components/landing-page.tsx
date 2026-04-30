'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Youtube, Loader2, Play } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { Input } from '@/core/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeVideoId } from '@/lib/youtube';

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/classroom/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          setPastSessions(data.sessions);
        }
      })
      .catch(console.error);
  }, []);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a YouTube URL.',
        variant: 'destructive',
      });
      return;
    }

    const videoId = getYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    router.push(`/classroom?videoId=${videoId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-16 bg-background">
      <div className="font-headline text-4xl font-bold text-primary mb-12">
        SyncStudy AI
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><path d="M9 15h6"/><path d="M12 12v6"/><path d="M14 2v4h-4V2"/></svg>
          </div>
          <CardTitle className="font-headline text-2xl">Join a Classroom</CardTitle>
          <CardDescription>Enter a YouTube lecture link to begin your synchronized learning session.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLaunch} className="space-y-4">
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : (
                'Launch Virtual Room'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pastSessions.length > 0 && (
        <div className="mt-12 w-full max-w-4xl">
          <h2 className="text-xl font-bold font-headline mb-4 text-center">Past Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastSessions.map((vidId) => (
              <Card 
                key={vidId} 
                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => router.push(`/classroom?videoId=${vidId}`)}
              >
                <div className="relative aspect-video w-full bg-muted">
                  <img 
                    src={`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`} 
                    alt={`YouTube Video ${vidId}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="text-white h-12 w-12" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">Video ID: {vidId}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-auto py-8 text-sm text-muted-foreground text-center">
        Powered by AI for enhanced learning experiences.
      </footer>
    </main>
  );
}
