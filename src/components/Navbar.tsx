"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[var(--bg-nav)] backdrop-blur-xl shadow-lg border-b border-[var(--border-color)] py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between gap-4">
        {/* Logo & Admin Session Timer */}
        <div className="flex items-center gap-3">
          <a
            href="#home"
            className="text-2xl font-black tracking-tight text-[var(--text-main)] hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <span className="gradient-text">D</span>anish
            <span className="text-indigo-500 animate-pulse">.</span>
          </a>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-400 transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-indigo-500 hover:text-indigo-400 transition-all duration-300 shadow-sm"
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} className="text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} className="text-indigo-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <Link href="/login" className="hidden sm:inline-block">
            <span className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              Admin
            </span>
          </Link>

          <a
            href="/DanishResume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
          >
            Resume
          </a>

          {/* Mobile menu toggle */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[var(--text-main)] hover:text-indigo-400 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-main)] backdrop-blur-2xl shadow-xl overflow-hidden"
          >
            <ul className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-base font-medium text-[var(--text-main)] hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2 flex flex-col gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center w-full rounded-full border border-[var(--border-color)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)]"
                >
                  Admin
                </Link>
                <a
                  href="/DanishResume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center w-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                >
                  Download Resume
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
