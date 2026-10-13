// Download bytes occupy 5–95%; the reader module and initialization use the rest.
export function pdfLoadingProgress(loaded: number, total: number | undefined, previous: number) {
  if (!Number.isFinite(loaded) || !total || !Number.isFinite(total) || total <= 0) return previous;
  const fraction = Math.max(0, Math.min(1, loaded / total));
  return Math.max(previous, 5 + Math.floor(fraction * 90));
}

// Next.js only exposes pending/complete for navigation, so this is an estimate.
export function estimatedLoadingProgress(elapsedMs: number) {
  return Math.min(95, Math.floor(96 * (1 - Math.exp(-Math.max(0, elapsedMs) / 6000))));
}
