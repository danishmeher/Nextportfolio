"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  duration?: number;
  once?: boolean;
}

export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.7,
  once = true,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  const getVariants = () => {
    const hidden: Record<string, number> = { opacity: 0 };
    const visible: Record<string, number> = { opacity: 1 };

    switch (direction) {
      case "up":
        hidden.y = 80;
        visible.y = 0;
        break;
      case "down":
        hidden.y = -80;
        visible.y = 0;
        break;
      case "left":
        hidden.x = 80;
        visible.x = 0;
        break;
      case "right":
        hidden.x = -80;
        visible.x = 0;
        break;
      case "fade":
      default:
        break;
    }

    return { hidden, visible };
  };

  const variants = getVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: variants.hidden,
        visible: variants.visible,
      }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {children}
    </motion.div>
  );
}
