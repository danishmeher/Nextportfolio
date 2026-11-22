import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  buildAssistantPrompt,
  buildAssistantSystemInstruction,
  formatConversationContents,
  getAllLiveContexts,
} from "@/lib/assistant";
import { portfolioProfile } from "@/lib/site-content";
import { notifyAiChat } from "@/lib/notifier";
import { saveAiChat } from "@/lib/visitor-store";

// Environment configurations (never hardcoded)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const CONFIGURED_MODEL = process.env.GEMINI_MODEL?.trim();
const CONFIGURED_FALLBACKS = process.env.GEMINI_FALLBACK_MODELS
  ? process.env.GEMINI_FALLBACK_MODELS.split(",")
      .map((m) => m.trim())
      .filter(Boolean)
  : [];
const TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || "0.75");
const MAX_OUTPUT_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || "350", 10);

// Default high-speed candidates prioritized by latency and availability
const FAST_CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.5-pro",
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
  const isUrdu = /(kya|haal|kaise|kaisa|bhai|kon|karta|batao|salam|assalam|khelta|kaam|sunao)/i.test(normalized);

  if (/(phone|number|call|contact|reach|email|rabta)/i.test(normalized)) {
    const phoneMatch = contactContext?.match(/Phone:\s*(.+)/i);
    const emailMatch = contactContext?.match(/Email:\s*(.+)/i);
    const email = emailMatch?.[1] || portfolioProfile.email;
    const phone = phoneMatch?.[1] || portfolioProfile.phone;

    if (isUrdu) {
      return `Aap Danish se direct email (${email}) ya WhatsApp (${phone}) par contact kar sakte hain! Nichay page par contact form bhi available hai.`;
    }
    return `You can reach Danish directly via email at ${email} or on WhatsApp at ${phone}. Feel free to drop a message in the contact form below!`;
  }

  if (/(resume|cv)/i.test(normalized)) {
    if (isUrdu) {
      return `Danish ka latest resume aap top navigation bar me diye gaye "Resume" button se easily download kar sakte hain!`;
    }
    return `You can view and download Danish's latest CV directly via the "Resume" button in the top navigation bar!`;
  }

  if (/(project|portfolio|work|kaam)/i.test(normalized)) {
    if (isUrdu) {
      return `Danish ne 7 Kings Code me CWS Hygiene aur CWS Workwear jaise enterprise platforms banaye hain React, Next.js aur Sitecore XM Cloud use karke. Projects section me details dekh sakte hain!`;
    }
    return `Danish has engineered major platforms like CWS Hygiene and CWS Workwear at 7 Kings Code using React, Next.js, and Sitecore XM Cloud. Feel free to explore the Projects section above for full details!`;
  }

  if (/(skill|stack|tech|technologies)/i.test(normalized)) {
    if (isUrdu) {
      return `Danish ka core tech stack React, Next.js, TypeScript, Node.js aur Sitecore XM Cloud hai, saath me Tailwind CSS aur modern web tooling.`;
    }
    return `Danish specializes in React, Next.js, TypeScript, Node.js, and Sitecore XM Cloud, focusing on scalable frontend systems and robust enterprise APIs.`;
  }

  if (isUrdu) {
    return `Assalam o Alaikum! Sab badhiya bhai, aap sunao? Danish ke kaam, enterprise projects ya skills ke baray me kuch poochna ho to batao.`;
  }

  return `Hey there! Feel free to ask me anything about Danish's work, tech stack, or recent enterprise projects. What's on your mind?`;
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

    // Fast cached live context retrieval (5-minute TTL to avoid continuous Firestore network roundtrips)
    const liveContexts = await getAllLiveContexts();
    const systemInstruction = buildAssistantSystemInstruction(liveContexts);
    const contents = formatConversationContents(
      question,
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
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: TEMPERATURE,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        });

        successfulModel = model;
        activeWorkingModel = model;
        break;
      } catch (err: any) {
        console.warn(`[Gemini] Model '${model}' failed with systemInstruction, trying fallback prompt:`, err?.message || err);
        try {
          // Fallback to combined prompt for legacy compatibility if model rejects systemInstruction
          const legacyPrompt = buildAssistantPrompt(
            question,
            [],
            liveContexts,
            Array.isArray(history) ? history : undefined
          );
          streamResult = await ai.models.generateContentStream({
            model: model,
            contents: legacyPrompt,
            config: {
              temperature: TEMPERATURE,
              maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
          });
          successfulModel = model;
          activeWorkingModel = model;
          break;
        } catch (innerErr: any) {
          lastError = innerErr;
          if (activeWorkingModel === model) {
            activeWorkingModel = null;
          }
        }
      }
    }

    if (!streamResult) {
      console.warn("All Gemini models failed or exhausted. Falling back to local assistant:", lastError);
      const localAns = buildLocalAnswer(question, liveContexts.contact);
      saveAiChat({
        question,
        answer: localAns,
        device: "Web Visitor",
        createdAt: Date.now(),
      }).catch(() => {});
      notifyAiChat({ question, answer: localAns }).catch(() => {});
      return createTextStreamResponse(localAns, "local-fallback");
    }

    // Return real-time streaming response
    const encoder = new TextEncoder();
    let completeAnswer = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            if (chunk.text) {
              completeAnswer += chunk.text;
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          // Save AI conversation log reliably (local store + Firestore sync)
          saveAiChat({
            question,
            answer: completeAnswer,
            device: "Web Visitor",
            createdAt: Date.now(),
          }).catch((err) => {
            console.error("[Assistant] Failed to save chat log:", err?.message || err);
          });

          // Optional notification
          notifyAiChat({ question, answer: completeAnswer }).catch(() => {});
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

