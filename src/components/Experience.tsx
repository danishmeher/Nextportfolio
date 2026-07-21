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
    role: "Frontend Developer",
    company: "7 Kings Code",
    period: "Current",
    description:
      "Building reusable UI components with React, integrating Sitecore XM Cloud for enterprise clients. Developing frontend systems, component libraries, and modern web applications for CWS Hygiene and CWS Workwear projects.",
    tags: ["React", "Sitecore XM Cloud", "TypeScript", "Frontend Components"],
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
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Experience() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });

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
              console.log("Seeded missing experiences to Firestore");
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
    <section id="experience" className="relative bg-surface py-24 md:py-32">
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
            className="text-sm font-semibold uppercase tracking-widest text-primary block"
          >
            Career
          </motion.span>
          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl md:text-5xl font-bold text-slate-900"
          >
            Work Experience
          </motion.h2>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-indigo-300 to-transparent" />

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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={`relative flex flex-col md:flex-row items-start mb-12 last:mb-0 ${
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      }`}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{
        duration: 0.8,
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {/* Timeline dot */}
      <motion.div
        className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/30 z-10"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      {/* Content card */}
      <div
        className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
          index % 2 === 0 ? "md:pr-8 md:mr-auto" : "md:pl-8 md:ml-auto"
        }`}
      >
        <div className="group rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-primary">
              <Briefcase size={20} />
            </div>
            {exp.current && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Current
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{exp.role}</h3>
          <p className="text-primary font-semibold mt-1">{exp.company}</p>
          <p className="text-sm text-slate-400 mt-1">{exp.period}</p>
          <p className="mt-4 text-slate-600 leading-relaxed">{exp.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {exp.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-100"
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
