import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Types
export interface Project {
  id?: string;
  title: string;
  company?: string;
  description: string;
  tags: string[];
  icon?: string;
  imageUrl?: string;
  link?: string;
  color: string;
  featured: boolean;
  order: number;
}

export interface Skill {
  id?: string;
  name: string;
  level: number;
  category: "frontend" | "backend" | "tools";
  order?: number;
}

export type SkillItem = {
  name: string;
  level: number;
};

export type SkillCategory = {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  order: number;
  skills: SkillItem[];
};

export interface Experience {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  current: boolean;
  order: number;
}

export interface AboutInfo {
  paragraphs: string[];
  highlights: { title: string; desc: string; icon: string }[];
  tags: string[];
}

export interface HeroInfo {
  name: string;
  title: string;
  subtitle: string;
  available: boolean;
  email: string;
  github: string;
  linkedin: string;
}

export interface ContactInfo {
  email: string;
  location: string;
  responseNote: string;
}

// Projects
export async function getProjects(): Promise<Project[]> {
  const q = query(collection(db, "projects"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
}

export async function addProject(project: Omit<Project, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "projects"), project);
  return docRef.id;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  await updateDoc(doc(db, "projects", id), project);
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, "projects", id));
}

// Skills
export async function getSkills(): Promise<Skill[]> {
  const q = query(collection(db, "skills"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Skill))
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return (a.order ?? 999) - (b.order ?? 999);
    });
}

export async function addSkill(skill: Omit<Skill, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "skills"), skill);
  return docRef.id;
}

export async function updateSkill(
  id: string,
  skill: Partial<Omit<Skill, "id">>
): Promise<void> {
  await updateDoc(doc(db, "skills", id), skill);
}

export async function deleteSkill(id: string): Promise<void> {
  await deleteDoc(doc(db, "skills", id));
}

// Get all skill categories once
export async function getSkillCategories(): Promise<SkillCategory[]> {
  const q = query(collection(db, "skillCategories"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SkillCategory[];
}

// Realtime listener
export function subscribeToSkillCategories(
  callback: (categories: SkillCategory[]) => void
) {
  const q = query(collection(db, "skillCategories"), orderBy("order", "asc"));

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SkillCategory[];

    callback(categories);
  });
}

// Add category
export async function addSkillCategory(
  category: Omit<SkillCategory, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, "skillCategories"), category);
  return docRef.id;
}

// Update category
export async function updateSkillCategory(
  id: string,
  category: Partial<Omit<SkillCategory, "id">>
): Promise<void> {
  await updateDoc(doc(db, "skillCategories", id), category);
}

// Delete category
export async function deleteSkillCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "skillCategories", id));
}

// Experience
export async function getExperiences(): Promise<Experience[]> {
  const q = query(collection(db, "experiences"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Experience));
}

export async function addExperience(exp: Omit<Experience, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "experiences"), exp);
  return docRef.id;
}

export async function updateExperience(id: string, exp: Partial<Experience>): Promise<void> {
  await updateDoc(doc(db, "experiences", id), exp);
}

export async function deleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, "experiences", id));
}

// About Info (single document)
export async function getAboutInfo(): Promise<AboutInfo | null> {
  const docSnap = await getDoc(doc(db, "settings", "about"));
  return docSnap.exists() ? (docSnap.data() as AboutInfo) : null;
}

export async function updateAboutInfo(info: AboutInfo): Promise<void> {
  await setDoc(doc(db, "settings", "about"), info);
}

// Hero Info (single document)
export async function getHeroInfo(): Promise<HeroInfo | null> {
  const docSnap = await getDoc(doc(db, "settings", "hero"));
  return docSnap.exists() ? (docSnap.data() as HeroInfo) : null;
}

export async function updateHeroInfo(info: HeroInfo): Promise<void> {
  await setDoc(doc(db, "settings", "hero"), info);
}

// Contact Info (single document)
export async function getContactInfo(): Promise<ContactInfo | null> {
  const docSnap = await getDoc(doc(db, "settings", "contact"));
  return docSnap.exists() ? (docSnap.data() as ContactInfo) : null;
}

export async function updateContactInfo(info: ContactInfo): Promise<void> {
  await setDoc(doc(db, "settings", "contact"), info);
}

// Initialize default data
export async function initializeDefaultData() {
  // Check if data already exists
  const projects = await getProjects();
  if (projects.length > 0) return;

  // Default projects
  const defaultProjects: Omit<Project, "id">[] = [
    {
      title: "CWS Hygiene",
      description: "Enterprise hygiene solutions platform built with Sitecore XM Cloud and React.",
      tags: ["Sitecore XM Cloud", "React", "Enterprise"],
      color: "from-indigo-500 to-violet-600",
      imageUrl:
        "https://images.unsplash.com/photo-1516509204642-7b4bd28d2f0b?auto=format&fit=crop&w=900&q=80",
      icon: "🏢",
      link: "https://7kingscode.com/cws-hygiene",
      featured: true,
      order: 1,
    },
    {
      title: "CWS Workwear",
      description: "Workwear solutions platform with Sitecore composable journeys.",
      tags: ["Sitecore", "Composable", "React"],
      color: "from-blue-500 to-cyan-500",
      imageUrl:
        "https://images.unsplash.com/photo-1521279488024-7b3b6a4feda7?auto=format&fit=crop&w=900&q=80",
      icon: "👔",
      link: "https://cws.global/workwear",
      featured: true,
      order: 2,
    },
    {
      title: "Sitecore XM Cloud SDK",
      description: "React SDK for Sitecore XM Cloud with composable content architecture.",
      tags: ["React", "SDK", "Composable Content"],
      color: "from-violet-500 to-purple-600",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      icon: "⚡",
      link: "https://sitecore.com/xm-cloud-sdk",
      featured: true,
      order: 3,
    },
  ];

  for (const project of defaultProjects) {
    await setDoc(doc(db, "projects", slugify(project.title)), project);
  }

  // Default skills
  const defaultSkills: Omit<Skill, "id">[] = [
    { name: "React", level: 95, category: "frontend" },
    { name: "Next.js", level: 90, category: "frontend" },
    { name: "TypeScript", level: 88, category: "frontend" },
    { name: "HTML/CSS", level: 95, category: "frontend" },
    { name: "Tailwind CSS", level: 92, category: "frontend" },
    { name: "Sitecore XM Cloud", level: 85, category: "backend" },
    { name: "REST APIs", level: 88, category: "backend" },
    { name: "Node.js", level: 80, category: "backend" },
    { name: "Git", level: 90, category: "tools" },
    { name: "Figma", level: 75, category: "tools" },
  ];

  for (const skill of defaultSkills) {
    await addSkill(skill);
  }

  // Default experiences
  const defaultExperiences: Omit<Experience, "id">[] = [
    {
      role: "Full Stack Developer",
      company: "7 Kings Code",
      period: "Current",
      description: "Building reusable UI components with React, integrating Sitecore XM Cloud for enterprise clients.",
      tags: ["React", "Sitecore XM Cloud", "TypeScript"],
      current: true,
      order: 1,
    },
    {
      role: "Website Developer",
      company: "Sheikh Toothpicks",
      period: "Previous",
      description: "Developed and maintained e-commerce platform with product management features.",
      tags: ["E-commerce", "Product Management"],
      current: false,
      order: 2,
    },
  ];

  for (const exp of defaultExperiences) {
    await addExperience(exp);
  }

  // Default hero info
  await updateHeroInfo({
    name: "Danish",
    title: "Frontend Developer",
    subtitle: "Frontend Developer specializing in React, Next.js & TypeScript. Building clean digital experiences and scalable UI systems.",
    available: true,
    email: "danish@example.com",
    github: "https://github.com/danish",
    linkedin: "https://linkedin.com/in/danish",
  });

  // Default about info
  await updateAboutInfo({
    paragraphs: [
      "I'm a Frontend Developer focused on building clean digital experiences and frontend systems.",
      "Currently working as a Full Stack Developer at 7 Kings Code, where I build reusable UI components and deliver modern web applications.",
      "I'm passionate about creating interfaces that are not only visually appealing but also highly functional and accessible.",
    ],
    highlights: [
      { title: "Clean Code", desc: "Writing maintainable, scalable code", icon: "Code" },
      { title: "Component Systems", desc: "Building reusable UI libraries", icon: "Layers" },
      { title: "UI/UX Focus", desc: "Crafting pixel-perfect interfaces", icon: "Palette" },
      { title: "Performance", desc: "Optimizing for speed", icon: "Zap" },
    ],
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  });

  // Default contact info
  await updateContactInfo({
    email: "danish@example.com",
    location: "Available Remotely",
    responseNote: "I typically respond within 24 hours.",
  });
}
