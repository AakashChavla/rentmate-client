'use client';
import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
const loadFeatures = (): Promise<(typeof import('motion/react'))['domAnimation']> =>
  import('./motion-features').then((module) => module.domAnimation);
export function MotionProvider({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
