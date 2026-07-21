"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    color: "from-indigo-500 to-violet-600",
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
    color: "from-blue-500 to-cyan-500",
    imageUrl:
      "https://images.unsplash.com/photo-1521279488024-7b3b6a4feda7?auto=format&fit=crop&w=900&q=80",
    icon: "👔",
    link: "https://cws.global/workwear",
    featured: true,
    order: 2,
  },
];

const slideUp = {
  hidden: { opacity: 0, y: 60 },
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
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const handleClick = () => {
    if (project.link) {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  if (featured) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 80 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{
          duration: 0.7,
          delay: index * 0.12,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        onClick={handleClick}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
          project.link ? "cursor-pointer" : ""
        }`}
      >
        <div
          className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${project.color}`}
        >
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <motion.span
              className="text-5xl"
              whileHover={{ scale: 1.3, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {project.icon || "📁"}
            </motion.span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              {project.company ? (
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {project.company}
                </p>
              ) : null}
              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                {project.title}
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </div>

          <p className="flex-1 text-sm leading-relaxed text-slate-500">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      onClick={handleClick}
      className={`group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
        project.link ? "cursor-pointer" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl">
              {project.icon || "📁"}
            </span>
          )}
        </div>
        <div>
          {project.company ? (
            <p className="text-sm font-medium text-slate-500 mb-1">
              {project.company}
            </p>
          ) : null}
          <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-primary">
            {project.title}
          </h3>
        </div>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-slate-500">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });

  const [projects, setProjects] = useState<Project[]>(fallbackProjects);

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
              console.log("Missing fallback projects seeded to Firestore");
            } catch (error) {
              console.error("Failed to seed missing projects to Firestore:", error);
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
            color: data.color || "from-slate-500 to-slate-700",
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

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
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
            Portfolio
          </motion.span>

          <motion.h2
            variants={slideUp}
            className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl"
          >
            Selected Projects
          </motion.h2>

          <motion.p
            variants={slideUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-slate-500"
          >
            A collection of projects I&apos;ve built, from enterprise platforms
            to personal experiments.
          </motion.p>
        </motion.div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {featured.map((project, i) => (
            <ProjectCard
              key={project.id || project.title}
              project={project}
              index={i}
              featured={true}
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project, i) => (
            <ProjectCard
              key={project.id || project.title}
              project={project}
              index={i}
              featured={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}