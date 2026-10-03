'use client';
import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { MOTION } from '../../config/motion';
export function Entrance({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: MOTION.OFFSET }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.DURATION.ENTRANCE, ease: MOTION.EASE }}
    >
      {children}
    </m.div>
  );
}
