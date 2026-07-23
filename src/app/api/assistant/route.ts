import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  buildAssistantPrompt,
  findRelevantChunks,
  getLiveProjectsContext,
  getLiveSkillsContext,
  getLiveExperienceContext,
  knowledgeChunks,
} from "@/lib/assistant";

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

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const relevantChunks = findRelevantChunks(question);
    
    // Query all live data in parallel
    const [projects, skills, experience] = await Promise.all([
      getLiveProjectsContext(),
      getLiveSkillsContext(),
      getLiveExperienceContext(),
    ]);

    const prompt = buildAssistantPrompt(
      question,
      relevantChunks.length ? relevantChunks : knowledgeChunks,
      { projects, skills, experience }
    );

    const answer = await callGemini(prompt);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Assistant API error:", error);
    const message =
      error instanceof Error ? error.message : "Assistant request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

