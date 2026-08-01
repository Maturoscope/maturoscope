// Gentle ease-out curve shared across the flow for subtle, natural motion.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

// Default duration for subtle fades/slides (kept gentle, not heavy).
const BASE_DURATION = 0.5

export const SIMPLE_FADE_VARIANT = {
  hidden: {
    opacity: 0,
    transition: { duration: BASE_DURATION, ease: EASE_OUT },
  },
  visible: {
    opacity: 1,
    transition: { duration: BASE_DURATION, ease: EASE_OUT },
  },
}

export const STAGGERED_LIST_VARIANT = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
      ease: EASE_OUT,
    },
  },
  viewport: { once: true, amount: 0.7 },
}

export const STAGGERED_LIST_ITEM_VARIANT = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: BASE_DURATION, ease: EASE_OUT },
  },
}

export const SIMPLE_FADE_DOWN_VARIANT = {
  hidden: {
    opacity: 0,
    y: -6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: BASE_DURATION, ease: EASE_OUT },
  },
}

// Subtle directional crossfade for advancing/going back between questions.
// `direction` is 1 when moving forward, -1 when moving back.
export const QUESTION_TRANSITION_VARIANT = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 8 : -8,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -8 : 8,
  }),
}

// --- Guided, sequenced entrance ("reveal") -------------------------------
// Orchestrates a top-to-bottom cascade so the eye is guided through the page.
// The container itself is invisible; it only schedules its children.

// Outer container: staggers major blocks (e.g. heading block, info block).
export const REVEAL_CONTAINER_VARIANT = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

// Inner group: staggers the individual elements inside a block, a bit tighter.
export const REVEAL_GROUP_VARIANT = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

// A single revealed element: gentle fade + rise.
export const REVEAL_ITEM_VARIANT = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

// Gentle fade-up for content entrances (e.g. results page).
// Transition (duration/ease/delay) is provided by the consuming component.
export const FADE_IN_UP_VARIANT = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}
