import {describe, expect, it} from 'vitest';
import {formatTime, getYoutubeVideoId} from './youtube';

describe('getYoutubeVideoId', () => {
  it('extracts ID from watch URL', () => {
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short URL', () => {
    expect(getYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid URL', () => {
    expect(getYoutubeVideoId('https://example.com/video')).toBeNull();
  });
});

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05');
  });

  it('formats hours when needed', () => {
    expect(formatTime(3725)).toBe('01:02:05');
  });
});
