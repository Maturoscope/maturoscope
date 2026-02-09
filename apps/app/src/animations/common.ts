export const SIMPLE_FADE_VARIANT = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

export const STAGGERED_LIST_VARIANT = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
  viewport: { once: true, amount: 0.7 },
}

export const STAGGERED_LIST_ITEM_VARIANT = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export const SIMPLE_FADE_DOWN_VARIANT = {
  hidden: {
    opacity: 0,
    y: "-100%",
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}
