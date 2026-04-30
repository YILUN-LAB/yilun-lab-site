import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { blurInWord, blurInWordTransition } from "@lib/motion-presets";

interface BlurTextProps {
  text: string;
  className?: string;
  staggerMs?: number;
}

export function BlurText({ text, className = "", staggerMs = 100 }: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
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

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em",
        margin: 0,
      }}
    >
      {words.map((w, i) => (
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
      ))}
    </p>
  );
}
