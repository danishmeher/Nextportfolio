"use client";

import Image from "next/image";
import { ArrowDown, Mail, Sparkles } from "lucide-react";
import ParticleCanvas from "./ParticleCanvas";

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

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* 60fps Particle canvas background */}
      <ParticleCanvas />

      {/* Ambient background glow colors */}
      <div className="absolute top-1/4 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/25 rounded-full blur-3xl md:blur-[120px] opacity-80 animate-blob pointer-events-none will-change-transform" />
      <div className="absolute top-1/3 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/25 rounded-full blur-3xl md:blur-[120px] opacity-80 animate-blob animation-delay-2000 pointer-events-none will-change-transform" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content - Native elements for instant sub-500ms LCP paint without hydration mutation */}
          <div>
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-400 backdrop-blur-xl mb-6 shadow-lg shadow-indigo-500/10 animate-shimmer">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span>Available for projects & full-time roles</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-main)] leading-[1.1]">
              Hi, I&apos;m{" "}
              <span className="gradient-text drop-shadow-sm">Danish</span>
            </h1>

            <div className="mt-4 flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <Sparkles size={20} className="animate-spin text-cyan-400" style={{ animationDuration: "8s" }} />
              <span>Full Stack Developer & Sitecore XM Cloud Engineer</span>
            </div>

            <p className="mt-5 text-base lg:text-lg font-normal text-[var(--text-muted)] max-w-lg leading-relaxed">
              Building high-concurrency, scalable frontend & backend platforms at{" "}
              <span className="font-bold text-[var(--text-main)]">7 Kings Code</span>.
              Specializing in <span className="font-semibold text-indigo-400">React</span>,{" "}
              <span className="font-semibold text-indigo-400">Next.js</span>, and{" "}
              <span className="font-semibold text-indigo-400">Sitecore XM Cloud</span> integrations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                View Selected Work
                <ArrowDown size={18} />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-7 py-4 text-sm font-bold text-[var(--text-main)] hover:border-indigo-500 hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-md"
              >
                Get In Touch
              </a>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <a
                href="https://github.com/danishmeher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-indigo-500 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
                aria-label="GitHub"
              >
                <GithubIcon size={20} />
              </a>

              <a
                href="https://www.linkedin.com/in/danishriazdani/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-indigo-500 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={20} />
              </a>

              <a
                href="mailto:danish.daniriaz@gmail.com"
                className="flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-indigo-500 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Right: Floating Avatar frame with GPU-composited rotating neon rings */}
          <div className="flex justify-center md:justify-end relative">
            <div className="relative">
              {/* Spinning gradient ring background - 100% GPU-composited CSS */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-400 to-emerald-400 opacity-60 blur-xl md:blur-2xl animate-spin-slow pointer-events-none will-change-transform" />

              {/* Outer rotating neon dashed ring - 100% GPU-composited CSS */}
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-cyan-400/40 pointer-events-none animate-spin-reverse-slow will-change-transform" />

              {/* Main Avatar container */}
              <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] rounded-full bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-400 p-1.5 shadow-2xl mx-auto">
                <div className="relative rounded-full overflow-hidden bg-slate-950 p-1 aspect-square">
                  <Image
                    src="/DanishImage.webp"
                    alt="Danish - Full Stack Developer"
                    width={420}
                    height={420}
                    className="rounded-full object-cover w-full h-full transform hover:scale-108 transition-transform duration-700"
                    priority
                    fetchPriority="high"
                    unoptimized
                    sizes="(max-width: 768px) 260px, (max-width: 1024px) 380px, 420px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
            Scroll Down
          </span>
          <div className="w-5 h-8 rounded-full border border-indigo-500/40 flex items-start justify-center p-1 bg-indigo-500/10">
            <div className="w-1.5 h-2 rounded-full bg-indigo-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
