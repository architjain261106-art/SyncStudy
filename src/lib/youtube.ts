/**
 * Extracts the YouTube video ID from a YouTube URL.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Formats seconds into a MM:SS or HH:MM:SS string.
 * @param timeInSeconds The time in seconds.
 * @returns A formatted time string.
 */
export function formatTime(timeInSeconds: number): string {
  if (isNaN(timeInSeconds)) {
    return "00:00";
  }
  const totalSeconds = Math.floor(timeInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = seconds.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  if (hours > 0) {
    const paddedHours = hours.toString().padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}
