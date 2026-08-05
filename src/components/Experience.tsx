"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Briefcase } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type ExperienceItem = {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  current: boolean;
  order?: number;
};

const fallbackExperiences: ExperienceItem[] = [
  {
    role: "Full Stack Developer",
    company: "7 Kings Code",
    period: "Current",
    description:
      "Building reusable UI components and scalable backend systems with React, Node.js, and Sitecore XM Cloud for enterprise clients. Developing full stack platforms and modern web applications for CWS Hygiene and CWS Workwear projects.",
    tags: ["React", "Sitecore XM Cloud", "TypeScript", "Full Stack Development"],
    current: true,
    order: 1,
  },
  {
    role: "Website Developer",
    company: "Global Study Expertz",
    period: "Previous",
    description:
      "Developed responsive web applications using React.js, Next.js, TypeScript, and Tailwind CSS while implementing new features and maintaining existing projects.",
    tags: ["E-commerce", "Product Management", "Web Development"],
    current: false,
    order: 2,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedExperiencesToFirestore(exps: ExperienceItem[] = fallbackExperiences) {
  const batch = writeBatch(db);

  exps.forEach((exp, idx) => {
    const id = slugify(`${exp.company}-${exp.role}`);
    const ref = doc(db, "experiences", id);
    batch.set(
      ref,
      {
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
        tags: exp.tags,
        current: exp.current,
        order: exp.order ?? idx + 1,
      },
      { merge: true }
    );
  });

  await batch.commit();
}

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Experience() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  const [exps, setExps] = useState<ExperienceItem[]>(fallbackExperiences);

  useEffect(() => {
    let seeded = false;

    const q = query(collection(db, "experiences"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const currentIds = new Set(snapshot.docs.map((d) => d.id));
        const missing = fallbackExperiences.filter(
          (e) => !currentIds.has(slugify(`${e.company}-${e.role}`))
        );

        if (missing.length > 0) {
          setExps(fallbackExperiences);

          if (!seeded) {
            seeded = true;
            try {
              await seedExperiencesToFirestore(missing);
            } catch (err) {
              console.error("Failed to seed experiences:", err);
            }
          }

          return;
        }

        if (snapshot.empty) {
          setExps(fallbackExperiences);
          return;
        }

        const firebaseExps: ExperienceItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            role: data.role || "",
            company: data.company || "",
            period: data.period || "",
            description: data.description || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            current: Boolean(data.current),
            order: data.order ?? 999,
          };
        });

        setExps(firebaseExps);
      },
      (error) => {
        console.error("Firebase fetch failed, using fallback experiences:", error);
        setExps(fallbackExperiences);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section id="experience" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={headingRef}
          className="text-center mb-16"
          initial="hidden"
          animate={headingInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.span
            variants={slideUp}
            className="text-xs font-bold uppercase tracking-widest text-indigo-400 block"
          >
            Career Journey
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl md:text-5xl font-black text-[var(--text-main)]"
          >
            Work Experience
          </motion.h2>
        </motion.div>

        <div className="relative">
          {/* Glowing vertical timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-400 to-transparent" />

          {exps.map((exp, i) => (
            <TimelineCard key={exp.id ?? slugify(`${exp.company}-${exp.role}`)} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineCard({
  exp,
  index,
}: {
  exp: ExperienceItem;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`relative flex flex-col md:flex-row items-start mb-12 last:mb-0 ${
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      }`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {/* Glowing Timeline Dot */}
      <motion.div
        className="absolute left-8 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-indigo-400 bg-slate-950 shadow-lg shadow-indigo-500/50 z-10 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      </motion.div>

      {/* Content card */}
      <div
        className={`ml-16 md:ml-0 md:w-[calc(50%-2.5rem)] ${
          index % 2 === 0 ? "md:pr-4 md:mr-auto" : "md:pl-4 md:ml-auto"
        }`}
      >
        <div className="glass-card glass-card-hover rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--text-main)]">{exp.role}</h3>
                <p className="text-indigo-400 font-bold text-sm">{exp.company}</p>
              </div>
            </div>
            {exp.current && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Current
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-[var(--text-muted)] mb-3">{exp.period}</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{exp.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {exp.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
