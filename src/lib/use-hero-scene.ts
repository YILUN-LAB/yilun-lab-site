import { useCallback, useEffect, useState, type RefObject } from "react";
import { useMotionValue } from "motion/react";
import { createHeroScrollController } from "./hero-scroll";

export function useHeroScene(
  heroRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLDivElement>
) {
  const exposure = useMotionValue(1);
  const playbackReady = useMotionValue(false);
  const onPlaybackReady = useCallback(
    (ready: boolean) => playbackReady.set(ready),
    [playbackReady]
  );
  const [contentVisible, setContentVisible] = useState(true);
  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;
    return createHeroScrollController({
      hero: heroRef.current,
      content: contentRef.current,
      exposure,
      playbackReady,
      onReveal: setContentVisible,
    });
  }, [heroRef, contentRef, exposure, playbackReady]);
  return { exposure, contentVisible, onPlaybackReady };
}
