"use client";

import { motion, useAnimationControls, type Variants } from "framer-motion";
import { useEffect, useMemo, type CSSProperties } from "react";

type BlurTextProps = {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  onAnimationComplete?: () => void;
  className?: string;
  style?: CSSProperties;
  as?: "p" | "h1" | "h2" | "h3" | "span";
};

export default function BlurText({
  text,
  delay = 150,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  className = "",
  style,
  as: Tag = "p",
}: BlurTextProps) {
  const units = useMemo(() => {
    if (animateBy === "letters") return text.split("");
    return text.split(/(\s+)/).filter((u) => u.length > 0);
  }, [text, animateBy]);

  const yFrom = direction === "top" ? -18 : 18;
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start("visible").then(() => onAnimationComplete?.());
  }, [controls, onAnimationComplete, text]);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: delay / 1000 },
    },
  };

  const child: Variants = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: yFrom,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Tag className={className} style={style}>
      <motion.span
        className="inline"
        initial="hidden"
        animate={controls}
        variants={container}
        aria-label={text}
      >
        {units.map((unit, i) => (
          <motion.span
            key={`${unit}-${i}`}
            className="inline-block whitespace-pre"
            variants={child}
          >
            {unit === " " ? "\u00A0" : unit}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
