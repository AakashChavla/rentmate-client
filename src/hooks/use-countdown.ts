"use client";

import { useEffect, useState } from "react";

export function useCountdown(seconds: number | null): number | null {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    if (seconds === null) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current === null || current <= 1) return 0;
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  return remaining;
}
