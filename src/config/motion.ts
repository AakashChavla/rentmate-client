export const MOTION = {
  DURATION: { ENTRANCE: 0.5, SHORT: 0.2, COUNTER: 0.8, FLOAT: 7, SHIMMER: 1.8 },
  EASE: [0.22, 1, 0.36, 1] as const,
  OFFSET: 16,
  STAGGER: 0.08,
  SPRING: { stiffness: 240, damping: 28 },
  FLOAT_OFFSET: 8,
  COUNT_MULTIPLIER: 1000,
  FLOAT_EASE: 'easeInOut',
  REPEAT: Infinity,
} as const;
