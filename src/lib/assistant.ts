import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { getPortfolioProfileContext } from "./site-content";

export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};

export const knowledgeChunks: KnowledgeChunk[] = [
  {
    id: "about",
    title: "About Danish (Identity & Specialization)",
    text: "Danish (Danish Riaz Dani) is a Full Stack Developer specializing in React, Next.js, TypeScript, Sitecore XM Cloud, Node.js, and modern web application development. He works at 7 Kings Code, engineering reusable component systems and enterprise web platforms.",
    tags: ["fullstack", "full stack", "react", "next.js", "typescript", "sitecore", "7 kings code", "danish", "developer", "bio"],
  },
  {
    id: "experience",
    title: "Career Experience & Professional Background",
    text: "Currently Full Stack Developer at 7 Kings Code, building enterprise platforms with React, Node.js, and Sitecore XM Cloud for clients like CWS Hygiene and CWS Workwear. Previously Website Developer at Global Study Expertz, building React, Next.js, and Tailwind web applications.",
    tags: ["experience", "career", "work", "job", "company", "role", "7 kings code", "global study expertz", "cws hygiene", "cws workwear"],
  },
  {
    id: "skills",
    title: "Technical Skills & Engineering Stack",
    text: "Primary Stack: React, Next.js, TypeScript, Sitecore XM Cloud, Tailwind CSS, Framer Motion. Backend & Cloud: Node.js, REST APIs, Firebase Firestore & Auth, PostgreSQL, Drizzle ORM. Tooling: Git, GitHub, Figma, Turbopack, Vercel.",
    tags: ["skills", "technologies", "stack", "react", "next.js", "typescript", "sitecore xm cloud", "backend", "fullstack", "full stack", "tools", "tailwind", "firebase"],
  },
  {
    id: "projects",
    title: "Key Projects & Case Studies",
    text: "1. CWS Hygiene (7 Kings Code): Enterprise hygiene solutions platform built with Sitecore XM Cloud & React. 2. CWS Workwear (CWS Global): Composable e-commerce workwear platform. 3. Modern Next.js Portfolio: High-performance portfolio with AI assistant, Firebase integration, and Framer Motion 3D animations.",
    tags: ["projects", "portfolio", "work examples", "case studies", "cws hygiene", "cws workwear", "sitecore", "enterprise"],
  },
  {
    id: "contact",
    title: "Contact Information & Links",
    text: "Email: danish.daniriaz@gmail.com | Phone: +92 302 4111148 | Location: Pakistan | LinkedIn: https://www.linkedin.com/in/danishriazdani/ | GitHub: https://github.com/danishmeher | Resume: /DanishResume.pdf",
    tags: ["contact", "email", "phone", "number", "resume", "cv", "linkedin", "github", "hire", "reach"],
  },
  {
    id: "hobbies",
    title: "Hobbies, Personal Life & Interests",
    text: "Outside of engineering clean UI systems, Danish is an avid cricket player, competitive gamer, tech enthusiast, and enjoys outdoor sports.",
    tags: ["hobbies", "interests", "free time", "cricket", "games", "sports", "fun", "gaming", "personal"],
  },
];

export async function getLiveProjectsContext(): Promise<string> {
  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "No projects are currently listed.";
    }

    const projectsList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const companyStr = data.company ? ` at ${data.company}` : "";
      const tagsStr = Array.isArray(data.tags) && data.tags.length > 0 ? ` (${data.tags.join(", ")})` : "";
      return `- ${data.title}${companyStr}: ${data.description}${tagsStr}`;
    });

    return projectsList.join("\n");
  } catch (error) {
    console.error("Failed to fetch live projects from Firestore:", error);
    return "- CWS Hygiene at 7 Kings Code: Enterprise hygiene platform built with Sitecore XM Cloud and React.\n- CWS Workwear at CWS Global: Workwear e-commerce platform with Sitecore composable architecture.";
  }
}

export async function getLiveSkillsContext(): Promise<string> {
  try {
    const q = query(collection(db, "skills"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "No skills are currently listed.";
    }

    const skillsByCategory: Record<string, string[]> = {};
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const cat = data.category || "other";
      if (!skillsByCategory[cat]) {
        skillsByCategory[cat] = [];
      }
      skillsByCategory[cat].push(data.name);
    });

    return Object.entries(skillsByCategory)
      .map(([cat, list]) => `- ${cat.toUpperCase()}: ${list.join(", ")}`)
      .join("\n");
  } catch (error) {
    console.error("Failed to fetch live skills from Firestore:", error);
    return "- FRONTEND: React, Next.js, TypeScript, HTML/CSS, Tailwind CSS\n- BACKEND: Sitecore XM Cloud, REST APIs, Firebase, Node.js\n- TOOLS: Git, Figma";
  }
}

export async function getLiveExperienceContext(): Promise<string> {
  try {
    const q = query(collection(db, "experiences"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "No career experience details are currently listed.";
    }

    const expList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const currentStr = data.current ? " (Current Role)" : "";
      return `- ${data.role} at ${data.company} [${data.period}]${currentStr}: ${data.description}`;
    });

    return expList.join("\n");
  } catch (error) {
    console.error("Failed to fetch live experiences from Firestore:", error);
    return "- Full Stack Developer at 7 Kings Code (Current Role): Building reusable UI & backend components with React, Node.js, and integrating Sitecore XM Cloud.\n- Website Developer at Global Study Expertz: Developed responsive web applications using React.js, Next.js, TypeScript, and Tailwind CSS.";
  }
}

export async function getLiveContactContext(): Promise<string> {
  try {
    return getPortfolioProfileContext();
  } catch (error) {
    console.error("Failed to build profile context:", error);
    return "Name: Danish Riaz Dani\nRole: Full Stack Developer\nEmail: danish.daniriaz@gmail.com\nPhone: +92 302 4111148\nResume: /DanishResume.pdf";
  }
}

interface CachedContext {
  projects: string;
  skills: string;
  experience: string;
  contact: string;
  timestamp: number;
}

let memoryContextCache: CachedContext | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function getAllLiveContexts(): Promise<{
  projects: string;
  skills: string;
  experience: string;
  contact: string;
}> {
  const now = Date.now();
  if (memoryContextCache && now - memoryContextCache.timestamp < CACHE_TTL_MS) {
    return {
      projects: memoryContextCache.projects,
      skills: memoryContextCache.skills,
      experience: memoryContextCache.experience,
      contact: memoryContextCache.contact,
    };
  }

  const [projects, skills, experience, contact] = await Promise.all([
    getLiveProjectsContext(),
    getLiveSkillsContext(),
    getLiveExperienceContext(),
    getLiveContactContext(),
  ]);

  memoryContextCache = {
    projects,
    skills,
    experience,
    contact,
    timestamp: now,
  };

  return { projects, skills, experience, contact };
}

function normalizeText(text: string) {
  return text.toLowerCase();
}

// Cleans up output without arbitrarily truncating natural human thoughts
export function shortenAssistantReply(text: string): string {
  const cleaned = text.trim();
  if (!cleaned) return "I'm here to help! Ask me anything about Danish's projects, experience, technical stack, or how to get in touch.";
  return cleaned;
}

export function findRelevantChunks(question: string) {
  const normalizedQuestion = normalizeText(question);

  return knowledgeChunks
    .map((chunk) => {
      const titleScore = chunk.tags.reduce(
        (score, tag) => score + (normalizedQuestion.includes(tag.toLowerCase()) ? 2.5 : 0),
        0
      );
      const textScore = chunk.text
        .split(/\s+/)
        .reduce(
          (score, word) => score + (normalizedQuestion.includes(word.toLowerCase()) ? 0.3 : 0),
          0
        );
      const contactBoost = chunk.id === "contact" && /(phone|number|call|contact|email|resume|cv|reach|hire)/i.test(question) ? 4 : 0;
      const experienceBoost = chunk.id === "experience" && /(work|job|experience|company|7 kings|code)/i.test(question) ? 4 : 0;

      return {
        chunk,
        score: titleScore + textScore + contactBoost + experienceBoost,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.chunk);
}

export function buildAssistantSystemInstruction(liveContexts?: {
  projects?: string;
  skills?: string;
  experience?: string;
  contact?: string;
}): string {
  const projects =
    liveContexts?.projects ||
    "- CWS Hygiene at 7 Kings Code: Enterprise platform built with Sitecore XM Cloud & React.\n- CWS Workwear at CWS Global: Workwear composable e-commerce platform.";
  const skills =
    liveContexts?.skills ||
    "- Frontend: React, Next.js, TypeScript, Tailwind CSS\n- Backend: Node.js, Sitecore XM Cloud, REST APIs, Firebase\n- Tooling: Git, GitHub, Figma, Vercel";
  const experience =
    liveContexts?.experience ||
    "- Full Stack Developer at 7 Kings Code (Current Role): Engineering scalable web platforms with React, Node.js, and Sitecore XM Cloud.\n- Website Developer at Global Study Expertz: Built modern web apps with React.js, Next.js, and TypeScript.";
  const contact =
    liveContexts?.contact ||
    "Email: danish.daniriaz@gmail.com | Phone/WhatsApp: +92 302 4111148 | Location: Pakistan | LinkedIn: https://www.linkedin.com/in/danishriazdani/ | GitHub: https://github.com/danishmeher | Resume: /DanishResume.pdf";

  return `You are the conversational AI companion on Danish Riaz Dani's portfolio.
You speak naturally, warmly, and realistically like a sharp, friendly colleague or peer who knows Danish well.

CORE PERSONA & HUMAN REALISM:
1. Speak Like a Real Human:
   - Talk naturally, directly, and casually. Avoid corporate clichés, canned scripts, and robotic greetings.
   - NEVER start with robotic boilerplate like "Welcome to Danish's portfolio! How can I help you today?" or "I am an automated assistant".
   - Jump straight into the conversation like a real person in a chat window.

2. Danish's Identity & Role:
   - Danish is a "Full Stack Developer" (STRICT MANDATE: NEVER refer to him as "Senior Full Stack Developer").
   - Current Role: Full Stack Developer at 7 Kings Code.
   - Core Tech: React, Next.js, TypeScript, Node.js, Sitecore XM Cloud, and Tailwind CSS.
   - Key Work: Enterprise platforms like CWS Hygiene and CWS Workwear.
   - Personal Side: Outside of code, he's into cricket, competitive gaming, and outdoor sports.

3. Language & Tone Matching:
   - If the user writes in Roman Urdu / Urdu / Hindi (e.g. 'kya haal hai', 'danish kya karta hai', 'projects btao'), reply in natural, fluent, friendly Roman Urdu (e.g. 'Sab theek thaak bhai! Aap sunao...').
   - If the user writes in English, reply in natural, engaging conversational English.
   - Mirror the user's tone: casual if they are casual, professional if they are formal.

4. Formatting & Natural Flow:
   - Keep answers concise and human (typically 2 to 4 sentences).
   - Do NOT overuse bold text or put asterisks around every technology name. Real people don't chat in excessive markdown.
   - Only use clean bullet points when the visitor asks for a list (like projects or tech stack).
   - Do NOT end every single message with a repetitive canned question (e.g., "Would you like his email?" or "Can I help with anything else?"). Let conversations flow naturally.

DANISH'S VERIFIED BACKGROUND & CONTEXT:
- Experience:
${experience}

- Key Projects:
${projects}

- Technical Skills:
${skills}

- Contact & Profiles:
${contact}`;
}

export function formatConversationContents(
  question: string,
  history?: { role: string; text: string }[]
): any[] | string {
  if (!history || history.length === 0) {
    return question;
  }

  // Filter out boilerplate initial greetings and empty messages
  const filteredHistory = history.filter(
    (h) =>
      h.text &&
      !h.text.toLowerCase().includes("how can i help you today") &&
      !h.text.toLowerCase().includes("i'm danish's ai assistant")
  );

  if (filteredHistory.length === 0) {
    return question;
  }

  const recentHistory = filteredHistory.slice(-6);
  const contents: any[] = recentHistory.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.text }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  return contents;
}

export function buildAssistantPrompt(
  question: string,
  chunks: KnowledgeChunk[],
  liveContexts?: {
    projects?: string;
    skills?: string;
    experience?: string;
    contact?: string;
  },
  history?: { role: string; text: string }[]
) {
  const systemInstruction = buildAssistantSystemInstruction(liveContexts);
  const historyText =
    history && history.length > 0
      ? `Recent Conversation Context:\n` +
        history
          .map((h) => `${h.role === "user" ? "Visitor" : "Assistant"}: ${h.text}`)
          .join("\n") +
        `\n\n`
      : ``;

  return `${systemInstruction}\n\n${historyText}Visitor Question: ${question}\n\nResponse (natural, human, realistic, concise):`;
}
