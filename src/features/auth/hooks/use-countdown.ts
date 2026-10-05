'use client';
import { useState, useEffect } from 'react';
import { useServices } from '../../../providers/ServicesProvider';
import { AUTH_LIMITS as L } from '../../../config/auth.constants';
export function useCountdown(initial = 0): { remaining: number; start(seconds: number): void } {
  const { clock } = useServices();
  const [deadline, setDeadline] = useState(() =>
    initial ? clock.now().getTime() + initial * L.MILLISECONDS : 0,
  );
  const [remaining, setRemaining] = useState(initial);
  useEffect(() => {
    const tick = (): void => {
      setRemaining(Math.max(0, Math.ceil((deadline - clock.now().getTime()) / L.MILLISECONDS)));
    };
    tick();
    if (!deadline) return;
    const interval = setInterval(tick, L.MILLISECONDS);
    return () => {
      clearInterval(interval);
    };
  }, [deadline, clock]);
  return {
    remaining,
    start: (seconds: number): void => {
      setDeadline(clock.now().getTime() + seconds * L.MILLISECONDS);
      setRemaining(seconds);
    },
  };
}
