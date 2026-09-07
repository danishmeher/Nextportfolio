import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  buildAssistantPrompt,
  findRelevantChunks,
  getAllLiveContexts,
  knowledgeChunks,
} from "@/lib/assistant";
import { portfolioProfile } from "@/lib/site-content";

// Environment configurations (never hardcoded)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const CONFIGURED_MODEL = process.env.GEMINI_MODEL?.trim();
const CONFIGURED_FALLBACKS = process.env.GEMINI_FALLBACK_MODELS
  ? process.env.GEMINI_FALLBACK_MODELS.split(",")
      .map((m) => m.trim())
      .filter(Boolean)
  : [];
const TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || "0.7");
const MAX_OUTPUT_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || "300", 10);

// Default high-speed candidates prioritized by latency and availability
const FAST_CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
];

// Initialize the Google Gen AI client once
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// In-memory cache for the validated active working model to ensure 0ms fallback penalty
let activeWorkingModel: string | null = null;

function getModelCandidates(): string[] {
  const list: string[] = [];

  // Priority 1: Configured model from environment variable
  if (CONFIGURED_MODEL && !list.includes(CONFIGURED_MODEL)) {
    list.push(CONFIGURED_MODEL);
  }

  // Priority 2: Previously confirmed working model
  if (activeWorkingModel && !list.includes(activeWorkingModel)) {
    list.push(activeWorkingModel);
  }

  // Priority 3: Fallback models configured in environment
  for (const model of CONFIGURED_FALLBACKS) {
    if (!list.includes(model)) {
      list.push(model);
    }
  }

  // Priority 4: Fast defaults pool
  for (const model of FAST_CANDIDATE_MODELS) {
    if (!list.includes(model)) {
      list.push(model);
    }
  }

  return list;
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
  /\w*baowala\w*/i,               // inappropriate terms
  /\w*blowjob\w*/i,               // blowjob, blowjobs
];

function containsInappropriate(text: string): boolean {
  return INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(text));
}

function buildLocalAnswer(question: string, contactContext?: string) {
  const normalized = question.toLowerCase();

  if (/(phone|number|call|contact|reach|email)/i.test(question)) {
    const phoneMatch = contactContext?.match(/Phone:\s*(.+)/i);
    const emailMatch = contactContext?.match(/Email:\s*(.+)/i);

    const email = emailMatch?.[1] || portfolioProfile.email;
    const phone = phoneMatch?.[1] || portfolioProfile.phone;

    return `You can easily reach Danish via email at **${email}** or by phone/WhatsApp at **${phone}**! 📩\n\nFeel free to send a message directly using the contact form at the bottom of the page!`;
  }

  if (normalized.includes("resume") || normalized.includes("cv")) {
    return `You can view and download Danish's latest CV directly from the header navigation bar! 📄\n\nIt covers his extensive experience at 7 Kings Code, technical stack, and key projects.`;
  }

  if (normalized.includes("project") || normalized.includes("portfolio") || normalized.includes("work")) {
    return `Danish has engineered several high-performance enterprise and full stack platforms — including **CWS Hygiene** and **CWS Workwear** at 7 Kings Code using React and Sitecore XM Cloud. 🚀\n\nCheck out the **Projects** section on this page to explore interactive demos and case studies!`;
  }

  if (normalized.includes("skill") || normalized.includes("stack") || normalized.includes("tech")) {
    return `Danish's core stack revolves around **React**, **Next.js**, **TypeScript**, **Node.js**, **Sitecore XM Cloud**, and **Tailwind CSS**. 💻\n\nHe specializes in building scalable frontend component libraries, REST APIs, and full stack web applications!`;
  }

  return `Thanks for reaching out! I'm Danish's AI assistant. Feel free to ask me anything about his full stack development background, enterprise projects at 7 Kings Code, technical skills, or contact info. How can I help you today? 😊`;
}

function createTextStreamResponse(text: string, modelName = "local") {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Assistant-Model": modelName,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { question, history } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (containsInappropriate(question)) {
      const responses = [
        "Please keep the conversation professional and respectful.",
        "I can help with Danish's work and portfolio. Let's keep it focused on that.",
        "I’m here to answer questions about Danish's skills, experience, or projects.",
        "Let’s stay on topic and keep things professional.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return createTextStreamResponse(randomResponse, "moderation");
    }

    // Fast cached context retrieval (5-minute TTL to avoid continuous Firestore network roundtrips)
    const [relevantChunks, liveContexts] = await Promise.all([
      findRelevantChunks(question),
      getAllLiveContexts(),
    ]);

    const prompt = buildAssistantPrompt(
      question,
      relevantChunks.length ? relevantChunks : knowledgeChunks,
      liveContexts,
      Array.isArray(history) ? history : undefined
    );

    if (!GEMINI_API_KEY || !ai) {
      return createTextStreamResponse(buildLocalAnswer(question, liveContexts.contact), "local-fallback");
    }

    // Attempt streaming with dynamic candidates
    const candidates = getModelCandidates();
    let streamResult: any = null;
    let successfulModel = "";
    let lastError: any = null;

    for (const model of candidates) {
      try {
        streamResult = await ai.models.generateContentStream({
          model: model,
          contents: prompt,
          config: {
            temperature: TEMPERATURE,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        });

        successfulModel = model;
        activeWorkingModel = model;
        break;
      } catch (err: any) {
        console.warn(`[Gemini] Model '${model}' failed, attempting fallback:`, err?.message || err);
        lastError = err;
        if (activeWorkingModel === model) {
          activeWorkingModel = null;
        }
      }
    }

    if (!streamResult) {
      console.warn("All Gemini models failed or exhausted. Falling back to local assistant:", lastError);
      return createTextStreamResponse(buildLocalAnswer(question, liveContexts.contact), "local-fallback");
    }

    // Return real-time streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Assistant-Model": successfulModel,
      },
    });
  } catch (error) {
    console.error("Assistant API error:", error);
    const message = error instanceof Error ? error.message : "Assistant request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

