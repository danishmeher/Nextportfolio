import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  buildAssistantPrompt,
  findRelevantChunks,
  getLiveProjectsContext,
  getLiveSkillsContext,
  getLiveExperienceContext,
  getLiveContactContext,
  knowledgeChunks,
} from "@/lib/assistant";
import { portfolioProfile } from "@/lib/site-content";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-pro").trim();

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  // Attempt using the configured model first, and fallback if needed
  const models = [
    GEMINI_MODEL,
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  const uniqueModels = Array.from(new Set(models));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`Failed to call Gemini model ${model}:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate content from any Gemini model.");
}

// List of pattern matches for inappropriate or profane words.
const INAPPROPRIATE_PATTERNS = [
  /\b(g[a@4]+y+s?)\b/i,          // gay, gays, g@y, g4y, etc.
  /\w*fuck\w*/i,                  // fuck, fucking, motherfucker, etc.
  /\w*shit\w*/i,                  // shit, bullshit, shitting, etc.
  /\w*bitch\w*/i,                 // bitch, bitches, bitching
  /\w*asshole\w*/i,               // asshole, assholes
  /\w*dumbass\w*/i,               // dumbass, dumbasses
  /\w*jackass\w*/i,               // jackass, jackasses
  /\bass\b/i,                     // ass (as a standalone word)
  /\w*cunt\w*/i,                  // cunt, cunts
  /\w*pussy\w*/i,                 // pussy, pussies
  /\w*fag\w*/i,                   // fag, fags, faggot, faggots
  /\w*nigger\w*/i,                // nigger, niggers
  /\w*nigga\w*/i,                 // nigga, niggas
  /\w*retard\w*/i,                // retard, retarded, retards
  /\w*slut\w*/i,                  // slut, sluts
  /\w*whore\w*/i,                 // whore, whores
  /\w*dick\w*/i,                  // dick, dicks, dickhead
  /\w*bastard\w*/i,               // bastard, bastards
  /\w*porn\w*/i,                  // porn, pornography, porno
  /\w*sex\w*/i,                   // sex, sexy, sexual, sexting
  /\w*naked\w*/i,                 // naked
  /\w*nude\w*/i,                  // nude, nudes, nudity
  /\banal\b/i,                    // anal (exact word only to avoid analysis/analytics)
  /\w*orgasm\w*/i,                // orgasm, orgasms
  /\w*vagina\w*/i,                // vagina, vaginas
  /\w*penis\w*/i,                 // penis, penises
  /\w*masturbat\w*/i,             // masturbate, masturbation
  /\w*baowala\w*/i,             // masturbate, masturbation
  /\w*blowjob\w*/i                // blowjob, blowjobs
];

function containsInappropriate(text: string): boolean {
  return INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(text));
}

function buildLocalAnswer(question: string, contactContext?: string) {
  const normalized = question.toLowerCase();

  if (/(phone|number|call|contact|reach|email)/i.test(question)) {
    const phoneMatch = contactContext?.match(/Phone:\s*(.+)/i);
    const emailMatch = contactContext?.match(/Email:\s*(.+)/i);
    const resumeMatch = contactContext?.match(/Resume:\s*(.+)/i);

    const email = emailMatch?.[1] || portfolioProfile.email;
    const phone = phoneMatch?.[1] || portfolioProfile.phone;
    const resume = resumeMatch?.[1] || portfolioProfile.resumeUrl;

    return `You can reach Danish through the contact section on the site, by email at ${email}, or by phone at ${phone}. His resume is also available here: ${resume}.`;
  }

  if (normalized.includes("resume") || normalized.includes("cv")) {
    return `His resume is available from the navigation bar here: ${portfolioProfile.resumeUrl}.`;
  }

  if (normalized.includes("project") || normalized.includes("portfolio")) {
    return `Danish has worked on a range of frontend and product-focused projects. I can point you to the featured work on his portfolio if you want.`;
  }

  if (normalized.includes("skill") || normalized.includes("stack") || normalized.includes("tech")) {
    return `He works mainly with React, Next.js, TypeScript, and Tailwind CSS, with a strong focus on clean frontend experiences.`;
  }

  return `I can help with Danish's background, projects, skills, or how to get in touch. If you want, I can point you to the right section of the site.`;
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (containsInappropriate(question)) {
      const responses = [
        "Please keep the conversation professional and respectful.",
        "I can help with Danish's work and portfolio. Let's keep it focused on that.",
        "I’m here to answer questions about Danish's skills, experience, or projects.",
        "Let’s stay on topic and keep things professional."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return NextResponse.json({ answer: randomResponse });
    }

    const relevantChunks = findRelevantChunks(question);

    const [projects, skills, experience, contact] = await Promise.all([
      getLiveProjectsContext(),
      getLiveSkillsContext(),
      getLiveExperienceContext(),
      getLiveContactContext(),
    ]);

    const prompt = buildAssistantPrompt(
      question,
      relevantChunks.length ? relevantChunks : knowledgeChunks,
      { projects, skills, experience, contact }
    );

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ answer: buildLocalAnswer(question, contact) });
    }

    try {
      const answer = await callGemini(prompt);
      return NextResponse.json({ answer });
    } catch (error) {
      console.warn("Gemini fallback triggered:", error);
      return NextResponse.json({ answer: buildLocalAnswer(question, contact) });
    }
  } catch (error) {
    console.error("Assistant API error:", error);
    const message =
      error instanceof Error ? error.message : "Assistant request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

