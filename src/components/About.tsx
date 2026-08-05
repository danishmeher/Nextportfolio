"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code, Layers, Palette, Zap } from "lucide-react";
import SectionDivider from "./SectionDivider";

const highlights = [
  {
    icon: Code,
    title: "Clean Architecture",
    desc: "Writing maintainable, scalable code with modern React & TypeScript best practices.",
  },
  {
    icon: Layers,
    title: "UI System Libraries",
    desc: "Building modular, accessible component systems for enterprise platforms.",
  },
  {
    icon: Palette,
    title: "Modern UI/UX",
    desc: "Crafting pixel-perfect, responsive interfaces with fluid micro-interactions.",
  },
  {
    icon: Zap,
    title: "Performance First",
    desc: "Optimizing Web Vitals, asset bundles, and rendering speed for maximum responsiveness.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function About() {
  const headingRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const leftInView = useInView(leftRef, { once: true, margin: "-80px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-16">
      <SectionDivider />
      <div className="mx-auto max-w-6xl px-6 mt-16">
        <motion.div
          ref={headingRef}
          className="text-center mb-16"
          initial="hidden"
          animate={headingInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.span
            variants={slideUp}
            className="text-xs font-bold uppercase tracking-widest text-indigo-400 block"
          >
            About Me
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl md:text-5xl font-black text-[var(--text-main)]"
          >
            Get To Know Me
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: About text */}
          <motion.div
            ref={leftRef}
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.p variants={slideFromLeft} className="text-lg text-[var(--text-muted)] leading-relaxed">
              I&apos;m a{" "}
              <span className="font-bold text-[var(--text-main)]">Full Stack Developer</span>{" "}
              specializing in constructing interactive, high-performance web applications and scalable software systems.
              My expertise centers around{" "}
              <span className="font-semibold text-indigo-400">React</span>,{" "}
              <span className="font-semibold text-indigo-400">Next.js</span>, and enterprise platforms like{" "}
              <span className="font-semibold text-indigo-400">Sitecore XM Cloud</span>.
            </motion.p>
            <motion.p variants={slideFromLeft} className="mt-5 text-base text-[var(--text-muted)] leading-relaxed">
              Currently engineering robust digital experiences at{" "}
              <span className="font-semibold text-[var(--text-main)]">
                7 Kings Code
              </span>
              , where I design modular component libraries, execute seamless Sitecore XM Cloud integrations, and deliver high-concurrency web apps.
            </motion.p>
            <motion.p variants={slideFromLeft} className="mt-5 text-base text-[var(--text-muted)] leading-relaxed">
              I am dedicated to writing clean, maintainable code paired with thoughtful design aesthetics. Every line of code I craft aims for speed, accessibility, and intuitive user delight.
            </motion.p>

            <motion.div variants={slideFromLeft} className="mt-8 flex flex-wrap gap-2.5">
              {["React", "Next.js", "TypeScript", "Sitecore XM Cloud", "Tailwind CSS", "Framer Motion"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 text-xs font-semibold text-indigo-400 backdrop-blur-md shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Highlight cards */}
          <motion.div
            ref={rightRef}
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate={rightInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {highlights.map((item) => (
              <motion.div key={item.title} variants={slideFromRight}>
                <div className="glass-card glass-card-hover rounded-2xl p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <item.icon size={22} />
                    </div>
                    <h3 className="font-bold text-[var(--text-main)] mb-1.5 text-base">{item.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
