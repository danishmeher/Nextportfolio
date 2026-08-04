"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle, PhoneCall } from "lucide-react";
import SectionDivider from "./SectionDivider";
import { toast } from "sonner";
import { portfolioProfile } from "@/lib/site-content";

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

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const headingRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const leftInView = useInView(leftRef, { once: true, margin: "-80px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-80px" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubmitted(true);
      toast.success(data.message || "Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-20">
      <SectionDivider />
      <div className="mx-auto mt-16 max-w-6xl px-6">
        <motion.div
          ref={headingRef}
          className="mb-16 text-center"
          initial="hidden"
          animate={headingInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.span
            variants={slideUp}
            className="block text-xs font-bold uppercase tracking-widest text-indigo-400"
          >
            Get In Touch
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl font-black text-[var(--text-main)] md:text-5xl"
          >
            Let&apos;s Build Together
          </motion.h2>
          <motion.p
            variants={slideUp}
            className="mx-auto mt-4 max-w-2xl text-base text-[var(--text-muted)]"
          >
            Have a project in mind, an engineering role, or a technical inquiry? Drop a message below and I&apos;ll get back to you promptly.
          </motion.p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-5">
          <motion.div
            ref={leftRef}
            className="space-y-4 md:col-span-2"
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div variants={slideFromLeft}>
              <div className="glass-card glass-card-hover flex items-start gap-4 rounded-2xl p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm">Email</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] font-medium">
                    {portfolioProfile.email}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideFromLeft}>
              <div className="glass-card glass-card-hover flex items-start gap-4 rounded-2xl p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm">Phone</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] font-medium">
                    {portfolioProfile.phone}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideFromLeft}>
              <div className="glass-card glass-card-hover flex items-start gap-4 rounded-2xl p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm">Location</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] font-medium">
                    {portfolioProfile.location}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideFromLeft}>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 p-6 text-white shadow-xl shadow-indigo-500/20">
                <h3 className="mb-2 text-base font-bold">Fast Response Guarantee</h3>
                <p className="text-xs leading-relaxed opacity-90 font-medium">
                  {portfolioProfile.responseTime} For urgent project inquiries, mark your subject as &quot;Urgent&quot; for prioritized handling.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            ref={rightRef}
            className="md:col-span-3"
            initial="hidden"
            animate={rightInView ? "visible" : "hidden"}
            variants={slideFromRight}
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-3xl p-8 shadow-xl"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Project Collaboration / Job Opportunity"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project goals or requirements..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitted || loading}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 ${
                  submitted
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                    : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                whileTap={!submitted && !loading ? { scale: 0.98 } : {}}
              >
                {submitted ? (
                  <>
                    <CheckCircle size={18} />
                    Message Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {loading ? "Sending..." : "Send Message"}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}