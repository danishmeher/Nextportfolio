"use client";

import Image from "next/image";
import { ArrowDown, Mail } from "lucide-react";
import { motion } from "framer-motion";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 -right-32 w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for work
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight"
            >
              Hi, I&apos;m{" "}
              <span className="gradient-text">Danish</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-5 text-lg lg:text-xl font-light text-slate-500 max-w-lg leading-relaxed"
            >
              Frontend Developer specializing in{" "}
              <span className="font-medium text-slate-700">React</span>,{" "}
              <span className="font-medium text-slate-700">Next.js</span> &{" "}
              <span className="font-medium text-slate-700">JavaScript</span>.
              Building clean digital experiences and scalable UI systems.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                View My Work
                <ArrowDown size={18} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-base font-semibold text-slate-700 hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                Get In Touch
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex items-center gap-4"
            >
              <a
                href="https://github.com/danishmeher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-indigo-50 transition-all duration-300"
                aria-label="GitHub"
              >
                <GithubIcon size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/danishriazdani/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-indigo-50 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={20} />
              </a>
              <a
                href="mailto:danish@example.com"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-indigo-50 transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Hero image */}
          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.8, x: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <div className="relative">
              {/* Decorative ring behind image */}
              <motion.div
                className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Gradient border */}
              <div className="relative w-[240px] sm:w-[300px] md:w-[360px] lg:w-[420px] rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-1.5 mx-auto">
                <div className="relative rounded-full overflow-hidden bg-white p-1 aspect-square">
                  <Image
                    src="/danish.png"
                    alt="Danish - Frontend Developer"
                    width={420}
                    height={420}
                    className="rounded-full object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-2 -right-2 rounded-2xl bg-white shadow-lg border border-slate-100 px-4 py-2.5 flex items-center gap-2"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-lg">⚛️</span>
                <span className="text-sm font-semibold text-slate-700">
                  React
                </span>
              </motion.div>

              <motion.div
                className="absolute -bottom-2 -left-4 rounded-2xl bg-white shadow-lg border border-slate-100 px-4 py-2.5 flex items-center gap-2"
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <span className="text-lg">🚀</span>
                <span className="text-sm font-semibold text-slate-700">
                  Next.js
                </span>
              </motion.div>

              <motion.div
                className="absolute top-1/2 -left-8 rounded-2xl bg-white shadow-lg border border-slate-100 px-4 py-2.5 flex items-center gap-2"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <span className="text-lg">💎</span>
                <span className="text-sm font-semibold text-slate-700">
                  JavaScript
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs font-medium tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            className="w-5 h-8 rounded-full border-2 border-slate-300 flex items-start justify-center p-1"
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
