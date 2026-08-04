"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing system...");

  useEffect(() => {
    // Lock scrolling while preloader is active
    document.body.style.overflow = "hidden";

    const startTime = Date.now();
    const minDuration = 600; // Minimum 600ms to show smooth progress without flicker
    const maxTimeout = 1600; // Safety cap so user is never stuck

    let animFrameId: number;
    let targetProgress = 20;

    // Listen to document ready & window load
    const handleLoad = () => {
      targetProgress = 100;
    };

    if (document.readyState === "complete") {
      targetProgress = 100;
    } else {
      window.addEventListener("load", handleLoad);
    }

    const interval = setInterval(() => {
      // Increment target progress gradually if page still loading
      if (targetProgress < 90) {
        targetProgress += Math.floor(Math.random() * 15) + 5;
        if (targetProgress > 90) targetProgress = 90;
      }
    }, 100);

    const updateProgress = () => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          const next = Math.min(prev + Math.ceil((targetProgress - prev) * 0.18) + 1, targetProgress);

          if (next < 35) {
            setStatusText("Initializing layout system...");
          } else if (next < 75) {
            setStatusText("Preloading components & assets...");
          } else if (next < 100) {
            setStatusText("Optimizing interactive experience...");
          } else {
            setStatusText("Welcome!");
          }

          return next;
        }
        return prev;
      });

      const elapsed = Date.now() - startTime;
      if (progress >= 100 || elapsed >= maxTimeout) {
        if (elapsed >= minDuration) {
          setProgress(100);
          setStatusText("Welcome!");
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "";
          }, 250);
          return;
        }
      }

      animFrameId = requestAnimationFrame(updateProgress);
    };

    animFrameId = requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearInterval(interval);
      cancelAnimationFrame(animFrameId);
      document.body.style.overflow = "";
    };
  }, [progress]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 selection:bg-none select-none pointer-events-auto"
        >
          {/* Ambient background glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            {/* Animated Logo Icon Badge */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Spinning gradient ring */}
              <motion.div
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-70 blur-md"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {/* Dashed outer orbit */}
              <motion.div
                className="absolute -inset-2 rounded-full border border-dashed border-cyan-400/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* Main Badge */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-indigo-500/40 shadow-2xl">
                <span className="text-3xl font-black tracking-tight text-white">
                  <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                    D
                  </span>
                  <span className="text-indigo-400 animate-pulse">.</span>
                </span>
              </div>
            </div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black tracking-tight text-slate-100 mb-1"
            >
              DANISH
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-8"
            >
              <Sparkles size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
              <span>Frontend Engineer</span>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-full p-1 shadow-inner relative overflow-hidden mb-3">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-lg shadow-indigo-500/50"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
              />
            </div>

            {/* Progress Percentage & Status */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span className="text-slate-400 animate-pulse">{statusText}</span>
              <span className="font-bold font-mono text-indigo-300">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
