export interface YouTubePlayer {
  getCurrentTime: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  destroy: () => void;
}

export interface YouTubePlayerState {
  UNSTARTED: number;
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
  BUFFERING: number;
  CUED: number;
}

export interface YouTubePlayerReadyEvent {
  target: YouTubePlayer;
}

export interface YouTubePlayerStateChangeEvent {
  data: number;
}

export interface YouTubeWindow extends Window {
  YT?: {
    Player: new (
      element: HTMLElement,
      config: {
        videoId: string;
        playerVars?: Record<string, string | number>;
        events?: {
          onReady?: (event: YouTubePlayerReadyEvent) => void;
          onStateChange?: (event: YouTubePlayerStateChangeEvent) => void;
        };
      }
    ) => YouTubePlayer;
    PlayerState: YouTubePlayerState;
  };
  onYouTubeIframeAPIReady?: () => void;
}
