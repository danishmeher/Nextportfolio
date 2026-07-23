import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};

export const knowledgeChunks: KnowledgeChunk[] = [
  {
    id: "about",
    title: "About Danish",
    text: "Danish is a frontend developer focused on building clean digital experiences and frontend systems with React, Next.js, TypeScript, and Tailwind CSS.",
    tags: ["frontend", "react", "next.js", "typescript", "tailwind", "portfolio"],
  },
  {
    id: "experience",
    title: "Current Role and Career Experience",
    text: "He works as a Frontend Developer, building reusable UI components and web applications.",
    tags: ["experience", "career", "work", "job", "company", "role", "7 Kings Code", "global study expertz"],
  },
  {
    id: "skills",
    title: "Skills",
    text: "He has expertise in frontend, backend, tools, and modern frameworks.",
    tags: ["skills", "technologies", "stack", "react", "next.js", "typescript", "backend", "frontend", "tools", "tailwind"],
  },
  {
    id: "projects",
    title: "Projects",
    text: "The portfolio highlights project examples and case studies.",
    tags: ["projects", "portfolio", "work examples", "case studies", "cws hygiene", "cws workwear", "sitecore"],
  },
  {
    id: "contact",
    title: "Contact",
    text: "Visitors can contact Danish through the contact section on the portfolio or by using the email link. There is also a resume button available in the navigation bar.",
    tags: ["contact", "email", "resume", "cv", "reach"],
  },
  {
    id: "hobbies",
    title: "Hobbies and Interests",
    text: "Outside of professional frontend engineering, Danish is passionate about sports and recreation. He loves playing and watching cricket, playing video games, and keeping up with various outdoor sports.",
    tags: ["hobbies", "interests", "free time", "cricket", "games", "sports", "fun", "play", "gaming"],
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
      const tagsStr = Array.isArray(data.tags) && data.tags.length > 0 ? ` (Built using: ${data.tags.join(", ")})` : "";
      return `- ${data.title}${companyStr}: ${data.description}${tagsStr}`;
    });
    
    return projectsList.join("\n");
  } catch (error) {
    console.error("Failed to fetch live projects from Firestore:", error);
    return "- CWS Hygiene at 7 Kings Code: Enterprise hygiene solutions platform built with Sitecore XM Cloud and React.\n- CWS Workwear at CWS Global: Workwear solutions platform with Sitecore composable journeys and React.";
  }
}

export async function getLiveSkillsContext(): Promise<string> {
  try {
    const q = query(collection(db, "skills"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return "No skills are currently listed.";
    }
    
    // Group skills by category
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
      .map(([cat, list]) => `- ${cat.charAt(0).toUpperCase() + cat.slice(1)} Skills: ${list.join(", ")}`)
      .join("\n");
  } catch (error) {
    console.error("Failed to fetch live skills from Firestore:", error);
    return "- Frontend Skills: React, Next.js, TypeScript, HTML/CSS, Tailwind CSS\n- Backend Skills: Sitecore XM Cloud, REST APIs, Firebase, Node.js\n- Tools: Git, Figma";
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
      const tagsStr = Array.isArray(data.tags) && data.tags.length > 0 ? ` (Keywords: ${data.tags.join(", ")})` : "";
      return `- ${data.role} at ${data.company} [${data.period}]${currentStr}: ${data.description}${tagsStr}`;
    });
    
    return expList.join("\n");
  } catch (error) {
    console.error("Failed to fetch live experiences from Firestore:", error);
    return "- Frontend Developer at 7 Kings Code (Current Role): Building reusable UI components with React, integrating Sitecore XM Cloud.\n- Website Developer at Global Study Expertz: Developed responsive web applications using React.js, Next.js, TypeScript, and Tailwind CSS.";
  }
}

function normalizeText(text: string) {
  return text.toLowerCase();
}

export function findRelevantChunks(question: string) {
  const normalizedQuestion = normalizeText(question);

  return knowledgeChunks
    .map((chunk) => {
      const titleScore = chunk.tags.reduce(
        (score, tag) => score + (normalizedQuestion.includes(tag.toLowerCase()) ? 2 : 0),
        0
      );
      const textScore = chunk.text
        .split(/\s+/)
        .reduce(
          (score, word) => score + (normalizedQuestion.includes(word.toLowerCase()) ? 0.25 : 0),
          0
        );

      return {
        chunk,
        score: titleScore + textScore,
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
  }
) {
  const retrievedText = chunks
    .map((chunk) => {
      if (chunk.id === "projects" && liveContexts?.projects) {
        return `- ${chunk.title}:\n${liveContexts.projects}`;
      }
      if (chunk.id === "skills" && liveContexts?.skills) {
        return `- ${chunk.title}:\n${liveContexts.skills}`;
      }
      if (chunk.id === "experience" && liveContexts?.experience) {
        return `- ${chunk.title}:\n${liveContexts.experience}`;
      }
      return `- ${chunk.title}: ${chunk.text}`;
    })
    .join("\n");

  return `You are a helpful assistant for Danish's portfolio. Use the portfolio details below to answer the user's question accurately and respectfully. 

If the question is unrelated to Danish, his professional background, skills, projects, experience, or hobbies, respond humbly and politely. Let the user know that you are his personal portfolio assistant and can only speak about his work, skills, hobbies (such as playing cricket, video games, and sports), and career details.

When listing reasons, details, or steps, please format them as a clear list. Start each list item on a new line beginning with a bullet character '* '. Keep your response concise, readable, and structured with appropriate spacing/newlines.

Portfolio details:
${retrievedText}

Question: ${question}

Answer:`;
}
