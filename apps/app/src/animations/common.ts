export const SIMPLE_FADE_VARIANT = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
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
      staggerChildren: 0.3,
      delayChildren: 0.4,
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
