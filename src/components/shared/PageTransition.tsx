'use client';
import { m, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { MOTION } from '../../config/motion';
export function PageTransition({ children }: { children: ReactNode }): React.JSX.Element {
  const path = usePathname();
  const reduced = useReducedMotion();
  return (
    <m.div
      key={path}
      initial={reduced ? false : { opacity: 0, y: MOTION.OFFSET }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : MOTION.DURATION.ENTRANCE, ease: MOTION.EASE }}
    >
      {children}
    </m.div>
  );
}
