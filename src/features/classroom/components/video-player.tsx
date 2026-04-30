'use client';

import { useEffect, useRef, useState } from 'react';
import { Switch } from "@/core/ui/switch";
import { Label } from "@/core/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card';
import type {
  YouTubePlayer,
  YouTubePlayerReadyEvent,
  YouTubePlayerStateChangeEvent,
  YouTubeWindow,
} from '@/lib/youtube-player';

type VideoPlayerProps = {
  videoId: string;
  isAutoPilot: boolean;
  onAutoPilotChange: (isAutoPilot: boolean) => void;
  onReady: (player: YouTubePlayer) => void;
  onStateChange: (isPlaying: boolean) => void;
};

export default function VideoPlayer({ videoId, isAutoPilot, onAutoPilotChange, onReady, onStateChange }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [playerStatus, setPlayerStatus] = useState("Loading...");

  useEffect(() => {
    const youtubeWindow = window as YouTubeWindow;
    if (youtubeWindow.YT?.Player) {
      setIsApiReady(true);
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      youtubeWindow.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    }

    return () => {
      if (youtubeWindow.onYouTubeIframeAPIReady) {
        youtubeWindow.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const youtubeWindow = window as YouTubeWindow;
    if (isApiReady && videoId && playerContainerRef.current && youtubeWindow.YT?.Player) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      const player = new youtubeWindow.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 1,
          'rel': 0,
        },
        events: {
          'onReady': (event: YouTubePlayerReadyEvent) => {
            playerRef.current = event.target;
            onReady(event.target);
            setPlayerStatus("Ready");
          },
          'onStateChange': (event: YouTubePlayerStateChangeEvent) => {
            const playerState = event.data;
            // Only consider session active when the video is truly PLAYING
            onStateChange(playerState === youtubeWindow.YT!.PlayerState.PLAYING);

            switch(playerState) {
              case youtubeWindow.YT!.PlayerState.UNSTARTED: setPlayerStatus("Unstarted"); break;
              case youtubeWindow.YT!.PlayerState.ENDED: setPlayerStatus("Finished"); break;
              case youtubeWindow.YT!.PlayerState.PLAYING: setPlayerStatus("Playing"); break;
              case youtubeWindow.YT!.PlayerState.PAUSED: setPlayerStatus("Paused"); break;
              case youtubeWindow.YT!.PlayerState.BUFFERING: setPlayerStatus("Buffering..."); break;
              case youtubeWindow.YT!.PlayerState.CUED: setPlayerStatus("Cued"); break;
              default: setPlayerStatus("Unknown");
            }
          }
        }
      });
      return () => {
        player.destroy();
      };
    }
  }, [isApiReady, onReady, onStateChange, videoId]);

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
