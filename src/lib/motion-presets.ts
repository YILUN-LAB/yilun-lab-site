import type { Variants, Transition } from "motion/react";

export const easeOut = [0, 0, 0.58, 1] as const;

export const fadeBlurIn = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  whileInView: { filter: "blur(0px)", opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: easeOut, delay } as Transition,
});

export const fadeBlurInImmediate = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeOut, delay } as Transition,
});

export const blurInWord: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 50 },
  visible: {
    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
    opacity: [0, 0.5, 1],
    y: [50, -5, 0],
  },
};

export const blurInWordTransition = (delayMs: number): Transition => ({
  duration: 0.7,
  times: [0, 0.5, 1],
  ease: easeOut,
  delay: delayMs / 1000,
});
