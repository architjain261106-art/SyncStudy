'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Youtube, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeVideoId } from '@/lib/youtube';

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-8 font-headline text-3xl font-bold text-primary">
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
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Powered by AI for enhanced learning experiences.
      </footer>
    </main>
  );
}
