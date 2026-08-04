"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  query,
  writeBatch,
} from "firebase/firestore";

import SectionDivider from "./SectionDivider";
import { db } from "@/lib/firebase";

type Skill = {
  id?: string;
  name: string;
  level: number;
  category: "frontend" | "backend" | "tools";
  order?: number;
};

type SkillCategory = {
  id?: string;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  skills: Skill[];
  order: number;
};

const fallbackSkills: Skill[] = [
  { name: "React", level: 95, category: "frontend" },
  { name: "Next.js", level: 90, category: "frontend" },
  { name: "TypeScript", level: 88, category: "frontend" },
  { name: "HTML/CSS", level: 95, category: "frontend" },
  { name: "Tailwind CSS", level: 92, category: "frontend" },
  { name: "Sitecore XM Cloud", level: 85, category: "backend" },
  { name: "REST APIs", level: 88, category: "backend" },
  { name: "Firebase", level: 78, category: "backend" },
  { name: "Node.js", level: 80, category: "backend" },
  { name: "Git", level: 90, category: "tools" },
  { name: "Figma", level: 75, category: "tools" },
];

const categories: SkillCategory[] = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    color: "from-indigo-500 via-purple-500 to-indigo-400",
    bgColor: "bg-indigo-500/10 border-indigo-500/30",
    textColor: "text-indigo-400",
    order: 1,
    skills: [],
  },
  {
    id: "backend",
    title: "Backend & Enterprise CMS",
    color: "from-cyan-500 via-teal-400 to-emerald-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/30",
    textColor: "text-cyan-400",
    order: 2,
    skills: [],
  },
  {
    id: "tools",
    title: "Tooling & Architecture",
    color: "from-emerald-400 via-teal-400 to-cyan-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    textColor: "text-emerald-400",
    order: 3,
    skills: [],
  },
];

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedSkillsToFirebase(skillsToSeed: Skill[] = fallbackSkills) {
  const batch = writeBatch(db);

  skillsToSeed.forEach((skill) => {
    const docId = slugify(skill.name);
    const ref = doc(db, "skills", docId);
    batch.set(ref, skill);
  });

  await batch.commit();
}

function SkillCard({
  category,
  index,
}: {
  category: SkillCategory;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="glass-card glass-card-hover rounded-3xl p-8"
    >
      <div
        className={`mb-8 inline-flex items-center gap-2 rounded-xl border px-4 py-2 backdrop-blur-md ${category.bgColor}`}
      >
        <span className={`text-xs font-bold uppercase tracking-wider ${category.textColor}`}>
          {category.title}
        </span>
      </div>

      <div className="space-y-6">
        {category.skills.map((skill, si) => (
          <div key={skill.name}>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--text-main)]">
                {skill.name}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {skill.level}%
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/20 dark:bg-slate-800/80 p-0.5 border border-[var(--border-color)]">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${category.color} shadow-sm shadow-indigo-500/50`}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                transition={{
                  duration: 1.2,
                  delay: index * 0.15 + si * 0.08,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  const [skills, setSkills] = useState<Skill[]>(fallbackSkills);

  useEffect(() => {
    let seeded = false;

    const q = query(collection(db, "skills"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const firebaseSkills: Skill[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Skill)
        );

        const existingNames = new Set(
          firebaseSkills.map((skill) => skill.name.toLowerCase())
        );
        const missingSkills = fallbackSkills.filter(
          (skill) => !existingNames.has(skill.name.toLowerCase())
        );

        if (missingSkills.length > 0 && !seeded) {
          seeded = true;
          try {
            await seedSkillsToFirebase(missingSkills);
          } catch (error) {
            console.error("Failed to seed Firebase skills:", error);
          }
        }

        if (snapshot.empty) {
          setSkills(fallbackSkills);
          return;
        }

        setSkills(firebaseSkills);
      },
      (error) => {
        console.error("Firebase fetch failed, using fallback skills:", error);
        setSkills(fallbackSkills);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section id="skills" className="relative py-20">
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
            Technical Stack
          </motion.span>

          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl font-black text-[var(--text-main)] md:text-5xl"
          >
            Skills & Capabilities
          </motion.h2>

          <motion.p
            variants={slideUp}
            className="mx-auto mt-4 max-w-2xl text-base text-[var(--text-muted)]"
          >
            Specialized toolkit refined through enterprise project delivery, performance engineering, and composable web architecture.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((cat, index) => (
            <SkillCard
              key={cat.id}
              category={{
                ...cat,
                skills: skills
                  .filter((skill) => skill.category === cat.id)
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
              }}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}