"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code, Layers, Palette, Zap } from "lucide-react";
import SectionDivider from "./SectionDivider";

const highlights = [
  {
    icon: Code,
    title: "Clean Code",
    desc: "Writing maintainable, scalable code with modern best practices",
  },
  {
    icon: Layers,
    title: "Component Systems",
    desc: "Building reusable UI component libraries for consistent design",
  },
  {
    icon: Palette,
    title: "UI/UX Focus",
    desc: "Crafting pixel-perfect interfaces with attention to user experience",
  },
  {
    icon: Zap,
    title: "Performance",
    desc: "Enhancing application speed for a smooth and engaging user experience",
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
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
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
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });
  const leftInView = useInView(leftRef, { once: true, margin: "-100px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative bg-white py-5">
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
            className="text-sm font-semibold uppercase tracking-widest text-primary block"
          >
            About Me
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl md:text-5xl font-bold text-slate-900"
          >
            Get to know me
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: About text */}
          <motion.div
            ref={leftRef}
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.p variants={slideFromLeft} className="text-lg text-slate-600 leading-relaxed">
              I&apos;m a{" "}
              <span className="font-semibold text-slate-800">Frontend Developer</span>{" "}
              focused on building clean digital experiences and frontend systems.
              I specialize in{" "}
              <span className="font-semibold text-primary">React</span>,{" "}
              <span className="font-semibold text-primary">Sitecore XM Cloud</span>{" "}
              integration, component libraries, content migration, and modern web
              application design.
            </motion.p>
            <motion.p variants={slideFromLeft} className="mt-5 text-lg text-slate-600 leading-relaxed">
              Currently working as a{" "}
              <span className="font-semibold text-slate-800">
                Frontend Developer at 7 Kings Code
              </span>
              , where I build reusable UI components, integrate with Sitecore XM Cloud,
              and deliver modern web applications for enterprise clients.
            </motion.p>
            <motion.p variants={slideFromLeft} className="mt-5 text-lg text-slate-600 leading-relaxed">
              I&apos;m passionate about creating interfaces that are not only visually
              appealing but also highly functional and accessible. Every project
              I take on is an opportunity to push the boundaries of what&apos;s
              possible on the web.
            </motion.p>

            <motion.div variants={slideFromLeft} className="mt-8 flex flex-wrap gap-3">
              {["React", "Next.js", "TypeScript", "Sitecore XM Cloud", "Tailwind CSS"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-primary border border-indigo-100"
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
                <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
