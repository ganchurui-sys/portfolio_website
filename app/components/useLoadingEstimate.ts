"use client";

import { useEffect, useState } from "react";
import { estimatedLoadingProgress } from "../loading-progress";

export function useLoadingEstimate() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      setProgress(estimatedLoadingProgress(performance.now() - started));
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  return progress;
}
