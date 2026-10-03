export const MOTION = {
  DURATION: { ENTRANCE: 0.5, SHORT: 0.2 },
  EASE: [0.22, 1, 0.36, 1] as const,
  OFFSET: 16,
  STAGGER: 0.08,
  SPRING: { stiffness: 240, damping: 28 },
} as const;
