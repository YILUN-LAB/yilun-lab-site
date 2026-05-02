import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion } from "motion/react";
import { blurInWord, blurInWordTransition } from "@lib/motion-presets";

const containerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  rowGap: "0.1em",
  margin: 0,
};

interface BlurTextProps {
  text: string;
  className?: string;
  staggerMs?: number;
  as?: "p" | "h1" | "h2";
}

export function BlurText({ text, className = "", staggerMs = 100, as = "p" }: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  const children = words.map((w, i) => (
    <motion.span
      key={i}
      variants={blurInWord}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      transition={blurInWordTransition(i * staggerMs)}
      style={{ display: "inline-block", marginRight: "0.32em" }}
    >
      {w}
    </motion.span>
  ));

  if (as === "h1") {
    return (
      <motion.h1
        ref={ref as RefObject<HTMLHeadingElement>}
        className={className}
        style={containerStyle}
      >
        {children}
      </motion.h1>
    );
  }
  if (as === "h2") {
    return (
      <motion.h2
        ref={ref as RefObject<HTMLHeadingElement>}
        className={className}
        style={containerStyle}
      >
        {children}
      </motion.h2>
    );
  }
  return (
    <motion.p
      ref={ref as RefObject<HTMLParagraphElement>}
      className={className}
      style={containerStyle}
    >
      {children}
    </motion.p>
  );
}
