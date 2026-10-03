'use client';
import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { MOTION } from '../../config/motion';
export function AnimatedNumber({ value }: { value: number }): React.JSX.Element {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const control = animate(0, value, {
      duration: MOTION.DURATION.COUNTER,
      onUpdate: (next) => {
        setDisplay(Math.round(next));
      },
    });
    return () => {
      control.stop();
    };
  }, [value, reduced]);
  return <span>{new Intl.NumberFormat(locale).format(display)}</span>;
}
