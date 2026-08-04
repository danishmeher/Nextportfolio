"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 5, suffix: "+", label: "Projects Delivered" },
  { value: 1, suffix: "+", label: "Years Experience" },
  { value: 10, suffix: "+", label: "Modern Technologies" },
  { value: 2, suffix: "", label: "Companies Worked" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-50px",
  });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const startTime = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 40, scale: 0.98 }
          }
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] shadow-2xl"
        >
          <div className="rounded-[22px] bg-[var(--bg-card)] backdrop-blur-2xl p-8 md:p-12 transition-colors duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <div className="text-4xl md:text-5xl font-black gradient-text">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
