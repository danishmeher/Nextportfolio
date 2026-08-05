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
    text: "Danish (Danish Riaz Dani) is a Senior Full Stack Developer & UI Architect specializing in React, Next.js, TypeScript, Sitecore XM Cloud, Node.js, and modern web application development. He works at 7 Kings Code, engineering reusable component systems and enterprise web platforms.",
    tags: ["fullstack", "full stack", "react", "next.js", "typescript", "sitecore", "7 kings code", "danish", "developer", "architect", "bio"],
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
    return "Name: Danish Riaz Dani\nRole: Senior Full Stack Developer\nEmail: danish.daniriaz@gmail.com\nPhone: +92 302 4111148\nResume: /DanishResume.pdf";
  }
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
  const retrievedText = chunks
    .map((chunk) => {
      if (chunk.id === "projects" && liveContexts?.projects) {
        return `${chunk.title}:\n${liveContexts.projects}`;
      }
      if (chunk.id === "skills" && liveContexts?.skills) {
        return `${chunk.title}:\n${liveContexts.skills}`;
      }
      if (chunk.id === "experience" && liveContexts?.experience) {
        return `${chunk.title}:\n${liveContexts.experience}`;
      }
      if (chunk.id === "contact" && liveContexts?.contact) {
        return `${chunk.title}:\n${liveContexts.contact}`;
      }
      return `${chunk.title}: ${chunk.text}`;
    })
    .join("\n\n");

  const historyText = history && history.length > 0
    ? `Recent Conversation Context:\n` + history.map(h => `${h.role === 'user' ? 'Visitor' : 'Assistant'}: ${h.text}`).join('\n') + `\n\n`
    : ``;

  return `You are Danish's official AI Portfolio Assistant — a warm, friendly, concise, and knowledgeable guide representing Danish Riaz Dani (Senior Full Stack Developer & Sitecore XM Cloud Engineer).

PERSONALITY & COMMUNICATION STYLE:
- Tone: Warm, human, helpful, and direct.
- CONCISENESS DIRECTIVE: Keep responses brief, crisp, and conversational. Deliver a clear, helpful response in 1 to 2 short sentences or a max of 2-3 concise bullet points (around 40 to 60 words max). Do NOT write long paragraphs.
- Speak naturally like a real human software engineer representing Danish.
- Use formatting (bullet points, bold text for key terms) to make answers scannable and delightful to read.
- If asked about hiring or contact, warmly encourage reaching out via email or LinkedIn.

KNOWLEDGE BASE ABOUT DANISH:
${retrievedText}

${historyText}Visitor Question: ${question}

Response (concise, warm, human, max 60 words):`;
}
