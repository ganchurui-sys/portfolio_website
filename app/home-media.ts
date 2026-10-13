export type VideoAssetUrls = {
  master: string;
  scrub: string;
};

const homeVideoAssets = {
  desktop: {
    master: "/home-media-v1/desktop-play.mp4",
    scrub: "/home-media-v1/desktop-scrub.mp4",
  },
  mobile: {
    master: "/home-media-v1/mobile-play.mp4",
    scrub: "/home-media-v1/mobile-scrub.mp4",
  },
} satisfies Record<string, VideoAssetUrls>;

export function selectHomeVideoAssets({
  viewportWidth,
  saveData = false,
  effectiveType,
}: {
  viewportWidth: number;
  saveData?: boolean;
  effectiveType?: string;
}): VideoAssetUrls {
  const useMobile = viewportWidth <= 760 || saveData ||
    ["slow-2g", "2g", "3g"].includes(effectiveType ?? "");
  return homeVideoAssets[useMobile ? "mobile" : "desktop"];
}

// The browser owns downloading, range requests and its media cache. Entry only
// needs the first playable second, never a Blob of the whole film. If the media
// fails or the connection is slow, reveal the page using the existing poster.
export function prepareVideoStart(
  video: HTMLVideoElement,
  {
    startTime,
    bufferSeconds = 1,
    timeoutMs = 6000,
    onProgress,
    onReady,
  }: {
    startTime: number;
    bufferSeconds?: number;
    timeoutMs?: number;
    onProgress: (progress: number) => void;
    onReady: () => void;
  },
): () => void {
  let disposed = false;
  let positioned = false;
  let lastProgress = -1;
  const events = ["loadedmetadata", "loadeddata", "canplay", "progress", "seeked"];

  const dispose = () => {
    disposed = true;
    clearTimeout(timeout);
    for (const event of events) video.removeEventListener(event, check);
    video.removeEventListener("error", finish);
  };

  const finish = () => {
    if (disposed) return;
    dispose();
    onReady();
  };

  const check = () => {
    if (disposed) return;
    if (!positioned && video.readyState >= 1) {
      positioned = true;
      video.currentTime = startTime;
    }

    let bufferedAhead = 0;
    for (let index = 0; index < video.buffered.length; index += 1) {
      if (video.buffered.start(index) <= startTime && video.buffered.end(index) > startTime) {
        bufferedAhead = video.buffered.end(index) - startTime;
        break;
      }
    }
    const progress = Math.min(95, Math.round(bufferedAhead / bufferSeconds * 95));
    if (progress !== lastProgress) {
      lastProgress = progress;
      onProgress(progress);
    }

    if (
      video.readyState >= 3 && !video.seeking &&
      Math.abs(video.currentTime - startTime) < 0.1 &&
      bufferedAhead >= bufferSeconds
    ) finish();
  };

  const timeout = setTimeout(finish, timeoutMs);
  for (const event of events) video.addEventListener(event, check);
  video.addEventListener("error", finish);
  if (video.error) finish();
  else check();
  return dispose;
}
