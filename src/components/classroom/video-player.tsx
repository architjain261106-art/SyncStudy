'use client';

import { useEffect, useRef, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type VideoPlayerProps = {
  videoId: string;
  isAutoPilot: boolean;
  onAutoPilotChange: (isAutoPilot: boolean) => void;
  onReady: (player: any) => void;
  onStateChange: (isPlaying: boolean) => void;
};

// This helps avoid type errors with the YouTube API not being available on initial render
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function VideoPlayer({ videoId, isAutoPilot, onAutoPilotChange, onReady, onStateChange }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [playerStatus, setPlayerStatus] = useState("Loading...");

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    }

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (isApiReady && videoId && playerContainerRef.current) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      const player = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 1,
          'rel': 0,
        },
        events: {
          'onReady': (event: any) => {
            playerRef.current = event.target;
            onReady(event.target);
            setPlayerStatus("Ready");
          },
          'onStateChange': (event: any) => {
            const playerState = event.data;
            // Only consider session active when the video is truly PLAYING
            onStateChange(playerState === window.YT.PlayerState.PLAYING);

            switch(playerState) {
              case window.YT.PlayerState.UNSTARTED: setPlayerStatus("Unstarted"); break;
              case window.YT.PlayerState.ENDED: setPlayerStatus("Finished"); break;
              case window.YT.PlayerState.PLAYING: setPlayerStatus("Playing"); break;
              case window.YT.PlayerState.PAUSED: setPlayerStatus("Paused"); break;
              case window.YT.PlayerState.BUFFERING: setPlayerStatus("Buffering..."); break;
              case window.YT.PlayerState.CUED: setPlayerStatus("Cued"); break;
              default: setPlayerStatus("Unknown");
            }
          }
        }
      });
    }
  }, [isApiReady, videoId, onReady, onStateChange]);

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full bg-slate-900 rounded-lg overflow-hidden shadow-lg">
        <div ref={playerContainerRef} id="youtube-player" className="w-full h-full" />
      </div>
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
                <CardTitle className="text-md font-headline">AI Classroom Intelligence</CardTitle>
                <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-primary">{playerStatus}</span></p>
            </div>
            <div className="flex items-center space-x-2">
                <Switch 
                    id="autopilot-mode" 
                    checked={isAutoPilot}
                    onCheckedChange={onAutoPilotChange}
                />
                <Label htmlFor="autopilot-mode" className="font-semibold">Auto-Pilot</Label>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
