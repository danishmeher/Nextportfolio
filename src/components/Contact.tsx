"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle , PhoneCall } from "lucide-react";
import SectionDivider from "./SectionDivider";
import { toast} from "sonner";

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

  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });
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
      console.log(data.message)
      toast.success(data.message || "Message sent successfully!")
      

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
    <section id="contact" className="relative bg-white py-24 md:py-32">
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
            className="block text-sm font-semibold uppercase tracking-widest text-primary"
          >
            Contact
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl"
          >
            Let&apos;s Work Together
          </motion.h2>
          <motion.p
            variants={slideUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-slate-500"
          >
            Have a project in mind? I&apos;d love to hear about it. Drop me a
            message and let&apos;s create something amazing.
          </motion.p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-5">
          <motion.div
            ref={leftRef}
            className="space-y-6 md:col-span-2"
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div variants={slideFromLeft}>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    danish.daniriaz@gmail.com
                  </p>
                </div>
              </div>
            </motion.div>
            
             <motion.div variants={slideFromLeft}>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <PhoneCall size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Phone Number</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    +92 302 4111148
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideFromLeft}>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Location</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Available Remotely
                  </p>
                </div>
              </div>
            </motion.div>
           

            <motion.div variants={slideFromLeft}>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white">
                <h3 className="mb-2 text-lg font-bold">Quick Response</h3>
                <p className="text-sm leading-relaxed text-indigo-100">
                  I typically respond within 24 hours. For urgent projects,
                  mention it in your message and I&apos;ll prioritize your
                  request.
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
              className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Project Inquiry"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitted || loading}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-all duration-300 ${
                  submitted
                    ? "bg-emerald-500"
                    : "bg-primary shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                whileHover={!submitted && !loading ? { y: -2 } : {}}
                whileTap={!submitted && !loading ? { scale: 0.98 } : {}}
              >
                {submitted ? (
                  <>
                    <CheckCircle size={20} />
                    Message Sent!
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