'use client';
import { m, useReducedMotion } from 'motion/react';
import { Children, type ReactNode } from 'react';
import { MOTION } from '../../config/motion';
export function StaggeredList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): React.JSX.Element {
  const reduced = useReducedMotion();
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <m.div
          initial={reduced ? false : { opacity: 0, y: MOTION.OFFSET }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: reduced ? 0 : MOTION.DURATION.ENTRANCE,
            delay: reduced ? 0 : index * MOTION.STAGGER,
            ease: MOTION.EASE,
          }}
        >
          {child}
        </m.div>
      ))}
    </div>
  );
}
