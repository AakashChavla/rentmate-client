# Design system and motion

Use CSS-variable brand indigo/teal, slate surfaces and semantic success/warning/danger colors. Define light/dark tokens and validate AA text contrast. Use Inter with a display font through next/font; inline SVG avoids third-party image traffic.
Use shadcn-style Button primitives, rounded-2xl cards and soft elevation. Add skeletons, personality-rich empty states and responsive keyboard-accessible shells with business features.
Import motion from motion/react via LazyMotion. MOTION stores durations, easings, spring and stagger tokens. MotionConfig uses reducedMotion=user. Animate transform and opacity only, avoid layout shift, and lazy-load animation features.
Page/list/sidebar/dialog/checkmark/wizard/counter patterns are recorded for future feature implementation; Phase 0 demonstrates only the entrance pattern.
