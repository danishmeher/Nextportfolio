"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-6 py-4">
      <motion.div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #4F46E5 50%, #e2e8f0 80%, transparent 100%)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 0.6 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
      />
    </div>
  );
}
