"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import TiltCard from "./TiltCard";

type Project = {
  id?: string;
  title: string;
  company?: string;
  description: string;
  tags: string[];
  color: string;
  icon?: string;
  imageUrl?: string;
  link?: string;
  featured: boolean;
  order?: number;
};

const fallbackProjects: Project[] = [
  {
    title: "CWS Hygiene",
    company: "7 Kings Code",
    description:
      "Enterprise hygiene solutions platform built with Sitecore XM Cloud and React. Composable architecture with reusable component library.",
    tags: ["Sitecore XM Cloud", "React", "Enterprise"],
    color: "from-indigo-600 to-violet-600",
    imageUrl:
      "https://images.unsplash.com/photo-1516509204642-7b4bd28d2f0b?auto=format&fit=crop&w=900&q=80",
    icon: "🏢",
    link: "https://www.cws.com/en/hygiene",
    featured: true,
    order: 1,
  },
  {
    title: "CWS Workwear",
    company: "CWS Global",
    description:
      "Workwear solutions platform with Sitecore composable journeys. Modern e-commerce experience with personalized content delivery.",
    tags: ["Sitecore", "Composable", "React"],
    color: "from-blue-600 to-cyan-500",
    imageUrl:
      "https://images.unsplash.com/photo-1521279488024-7b3b6a4feda7?auto=format&fit=crop&w=900&q=80",
    icon: "👔",
    link: "https://cws.global/workwear",
    featured: true,
    order: 2,
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedProjectsToFirestore(projectsToSeed: Project[] = fallbackProjects) {
  const batch = writeBatch(db);

  projectsToSeed.forEach((project, index) => {
    const docId = slugify(project.title);
    const ref = doc(db, "projects", docId);

    batch.set(
      ref,
      {
        title: project.title,
        company: project.company,
        description: project.description,
        tags: project.tags,
        color: project.color,
        icon: project.icon,
        imageUrl: project.imageUrl,
        link: project.link,
        featured: project.featured,
        order: project.order ?? index + 1,
      },
      { merge: true }
    );
  });

  await batch.commit();
}

function ProjectCard({
  project,
  index,
  featured,
}: {
  project: Project;
  index: number;
  featured: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const handleClick = () => {
    if (project.link) {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      <TiltCard
        onClick={handleClick}
        className={`group glass-card glass-card-hover relative flex flex-col h-full overflow-hidden rounded-3xl p-0 transition-all duration-500 ${
          project.link ? "cursor-pointer" : ""
        }`}
      >
        {/* Top Banner Image / Graphic */}
        <div
          className={`relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${
            project.color || "from-indigo-600 to-cyan-500"
          }`}
        >
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <span className="text-5xl transform transition-transform group-hover:scale-125">
              {project.icon || "📁"}
            </span>
          )}
          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/0 transition-colors duration-300" />

          {featured && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300 shadow-md z-10">
              <Sparkles size={12} className="text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
              Featured Project
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              {project.company ? (
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  {project.company}
                </p>
              ) : null}
              <h3 className="text-xl font-black text-[var(--text-main)] transition-colors group-hover:text-indigo-400">
                {project.title}
              </h3>
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] group-hover:border-indigo-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-300">
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </div>

          <p className="flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Projects() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filterCategories = ["All", "Sitecore & Enterprise", "React & Next.js"];

  useEffect(() => {
    let seeded = false;
    const q = query(collection(db, "projects"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const currentIds = new Set(snapshot.docs.map((doc) => doc.id));
        const missingProjects = fallbackProjects.filter(
          (project) => !currentIds.has(slugify(project.title))
        );

        if (missingProjects.length > 0) {
          setProjects(fallbackProjects);

          if (!seeded) {
            seeded = true;
            try {
              await seedProjectsToFirestore(missingProjects);
            } catch (error) {
              console.error("Failed to seed missing projects:", error);
            }
          }
          return;
        }

        const firebaseProjects: Project[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            company: data.company || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            color: data.color || "from-indigo-600 to-cyan-500",
            icon: typeof data.icon === "string" ? data.icon : undefined,
            imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined,
            link: typeof data.link === "string" ? data.link : undefined,
            featured: Boolean(data.featured),
            order: data.order ?? 999,
          };
        });

        setProjects(firebaseProjects);
      },
      (error) => {
        console.error("Firebase fetch failed, using fallback projects:", error);
        setProjects(fallbackProjects);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Sitecore & Enterprise") {
      return (
        project.tags.some((t) => t.toLowerCase().includes("sitecore") || t.toLowerCase().includes("enterprise")) ||
        project.description.toLowerCase().includes("sitecore")
      );
    }
    if (activeFilter === "React & Next.js") {
      return project.tags.some((t) => t.toLowerCase().includes("react") || t.toLowerCase().includes("next"));
    }
    return true;
  });

  return (
    <section id="projects" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={headingRef}
          className="mb-12 text-center"
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
            Portfolio
          </motion.span>

          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl font-black text-[var(--text-main)] md:text-5xl"
          >
            Featured Engineering Projects
          </motion.h2>

          <motion.p
            variants={slideUp}
            className="mx-auto mt-4 max-w-2xl text-base text-[var(--text-muted)]"
          >
            Showcasing production applications, enterprise Sitecore composable architectures, and scalable UI systems.
          </motion.p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`relative rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 ${
                activeFilter === cat
                  ? "text-white shadow-lg shadow-indigo-500/25"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {activeFilter === cat && (
                <motion.div
                  layoutId="projectTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence>
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id || project.title}
                project={project}
                index={i}
                featured={project.featured}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}