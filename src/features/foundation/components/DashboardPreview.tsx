'use client';
import { m, useReducedMotion } from 'motion/react';
import { MOTION } from '../../../config/motion';
import { PreviewHeader, PreviewChart, PreviewStats, PreviewTask } from './PreviewCards';
export function DashboardPreview(): React.JSX.Element {
  const reduced = useReducedMotion();
  const transition = {
    duration: MOTION.DURATION.FLOAT,
    repeat: MOTION.REPEAT,
    ease: MOTION.FLOAT_EASE,
  };
  return (
    <div className="relative mx-auto w-full max-w-xl pb-8 pt-6">
      <m.div
        animate={reduced ? { y: 0 } : { y: [0, -MOTION.FLOAT_OFFSET, 0] }}
        transition={transition}
        className="relative rounded-3xl border border-border bg-card p-5 shadow-preview md:p-7"
      >
        <PreviewHeader />
        <PreviewChart />
        <PreviewStats />
      </m.div>
      <m.div
        animate={reduced ? { y: 0 } : { y: [0, MOTION.FLOAT_OFFSET, 0] }}
        transition={transition}
        className="relative mx-4 -mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft md:absolute md:-bottom-1 md:-start-5 md:mx-0"
      >
        <PreviewTask />
      </m.div>
    </div>
  );
}
