export type VideoAssetUrls = {
  master: string;
  scrub: string;
};

export function isVideoRangeBuffered(video: Pick<HTMLVideoElement, "buffered">, start: number, end: number) {
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  for (let index = 0; index < video.buffered.length; index += 1) {
    if (video.buffered.start(index) <= from && video.buffered.end(index) >= to) return true;
  }
  return false;
}

const homeVideoAssets = {
  desktop: {
    master: "/home-media-v2/desktop.mp4",
    scrub: "/home-media-v2/desktop.mp4",
  },
  mobile: {
    master: "/home-media-v2/mobile.mp4",
    scrub: "/home-media-v2/mobile.mp4",
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

// One completely downloaded video is shared by playback and scrubbing. Keep its
// object URL for this browser session, including returns from project pages.
export function createVideoCache(fetchAsset: typeof fetch = fetch) {
  const cache = new Map<string, { promise: Promise<string>; progress: number; listeners: Set<(progress: number) => void> }>();
  return (source: string, onProgress: (progress: number) => void): Promise<string> => {
    let entry = cache.get(source);
    if (!entry) {
      const listeners = new Set<(progress: number) => void>();
      const next = { promise: Promise.resolve(""), progress: 0, listeners };
      next.promise = (async () => {
        const response = await fetchAsset(source, { cache: "force-cache", signal: AbortSignal.timeout(120_000) });
        if (!response.ok) throw new Error(`Video request failed (${response.status})`);
        const total = Number(response.headers.get("content-length")) || (source.includes("mobile") ? 3194551 : 6345315);
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        let received = 0;
        const report = (value: number) => {
          next.progress = value;
          for (const listener of listeners) listener(value);
        };
        if (response.body) {
          const reader = response.body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(new Uint8Array(value));
            received += value.byteLength;
            report(Math.min(0.99, received / total));
          }
        } else {
          chunks.push(new Uint8Array(await response.arrayBuffer()));
        }
        const url = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
        report(1);
        return url;
      })().catch(error => { cache.delete(source); throw error; });
      cache.set(source, next);
      entry = next;
    }
    entry.listeners.add(onProgress);
    onProgress(entry.progress);
    const current = entry;
    return entry.promise.finally(() => current.listeners.delete(onProgress));
  };
}

export const loadHomeVideo = createVideoCache();

export function waitForVideoFrame(video: HTMLVideoElement, time: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let positioned = false;
    const events = ["loadedmetadata", "loadeddata", "canplay", "seeked"];
    const cleanup = () => {
      clearTimeout(timer);
      for (const event of events) video.removeEventListener(event, check);
      video.removeEventListener("error", fail);
      signal.removeEventListener("abort", fail);
    };
    const fail = () => { cleanup(); reject(new Error("The video could not be prepared.")); };
    const check = () => {
      if (!positioned && video.readyState >= 1) {
        positioned = true;
        video.currentTime = time;
      }
      if (video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - time) < 0.1) {
        cleanup(); resolve();
      }
    };
    const timer = setTimeout(fail, 30_000);
    for (const event of events) video.addEventListener(event, check);
    video.addEventListener("error", fail);
    signal.addEventListener("abort", fail);
    if (signal.aborted || video.error) fail(); else check();
  });
}
