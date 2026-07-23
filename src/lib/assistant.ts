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
    title: "Current Role",
    text: "He currently works as a Frontend Developer at 7 Kings Code, building reusable UI components, integrating with Sitecore XM Cloud, and delivering modern web applications.",
    tags: ["experience", "7 Kings Code", "sitecore", "xm cloud", "work", "company"],
  },
  {
    id: "skills",
    title: "Skills",
    text: "His main skills are React, Next.js, TypeScript, Tailwind CSS, component-driven design, Sitecore XM Cloud integration, and performance-minded UI development.",
    tags: ["skills", "technologies", "stack", "react", "next.js", "sitecore"],
  },
  {
    id: "projects",
    title: "Projects",
    text: "The portfolio highlights project examples and case studies. Each project showcases frontend development work, clean UI, and interactive experience design.",
    tags: ["projects", "portfolio", "work examples", "case studies"],
  },
  {
    id: "contact",
    title: "Contact",
    text: "Visitors can contact Danish through the contact section on the portfolio or by using the email link. There is also a resume button available in the navigation bar.",
    tags: ["contact", "email", "resume", "cv", "reach"],
  },
];

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

export function buildAssistantPrompt(question: string, chunks: KnowledgeChunk[]) {
  const retrievedText = chunks
    .map((chunk) => `- ${chunk.title}: ${chunk.text}`)
    .join("\n");

  return `You are a helpful assistant for Danish's portfolio. Use the portfolio details below to answer the user's question accurately and respectfully. If the question is unrelated to Danish, explain that you only know about his skills, experience, projects, and portfolio content.

When listing reasons, details, or steps, please format them as a clear list. Start each list item on a new line beginning with a bullet character '* '. Keep your response concise, readable, and structured with appropriate spacing/newlines.

Portfolio details:
${retrievedText}

Question: ${question}

Answer:`;
}
