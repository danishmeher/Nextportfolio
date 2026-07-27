"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  streaming?: boolean;
};

function TypingIndicator() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((current) => (current % 3) + 1);
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5" aria-label="Typing">
      <span className="text-2xl text-slate-500">{'.'.repeat(dots)}</span>
    </div>
  );
}

function FormatMessageText({ text }: { text: string }) {
  const normalizedText = text
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/(?<!\*)\*(?!\*)/g, "");
  const lines = normalizedText.split("\n");

  return (
    <div className="space-y-1.5 whitespace-pre-line text-sm leading-relaxed">
      {lines.map((line, idx) => {
        let content: React.ReactNode = line;
        
        // Parse bold markers **word** -> <strong>word</strong>
        if (line.includes("**")) {
          const parts = line.split("**");
          content = parts.map((part, i) => {
            if (i % 2 === 1) {
              return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
            }
            return part;
          });
        }

        // If the line starts with a list bullet (e.g. "* ", "- ", "• ")
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          // Remove the bullet character
          const cleanLine = line.replace(/^\s*[\*\-•]\s*/, "");
          const parts = cleanLine.split("**");
          const lineContent = parts.map((part, i) => {
            if (i % 2 === 1) {
              return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
            }
            return part;
          });
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>{lineContent}</span>
            </div>
          );
        }

        return <p key={idx}>{content}</p>;
      })}
    </div>
  );
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hey! I can help with Danish's work, projects, skills, or how to get in touch.",
    },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const streamAssistantReply = (answer: string, messageIndex: number) => {
    const words = answer.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      setMessages((current) =>
        current.map((message, index) =>
          index === messageIndex ? { ...message, text: answer, streaming: false } : message
        )
      );
      setLoading(false);
      return;
    }

    let step = 0;
    const intervalId = window.setInterval(() => {
      const nextText = words.slice(0, step + 1).join(" ");

      setMessages((current) =>
        current.map((message, index) =>
          index === messageIndex ? { ...message, text: nextText, streaming: step < words.length - 1 } : message
        )
      );

      step += 1;

      if (step >= words.length) {
        window.clearInterval(intervalId);
        setLoading(false);
        setMessages((current) =>
          current.map((message, index) =>
            index === messageIndex ? { ...message, streaming: false } : message
          )
        );
      }
    }, 40);
  };

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    let assistantIndex = 0;
    setMessages((current) => {
      const nextMessages = [...current, { role: "user" as const, text: trimmed }];
      assistantIndex = nextMessages.length;
      nextMessages.push({ role: "assistant" as const, text: "", streaming: true });
      return nextMessages;
    });
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error || "Assistant request failed.";
        setMessages((current) =>
          current.map((message, index) =>
            index === assistantIndex ? { ...message, text: errorMessage, streaming: false } : message
          )
        );
        setLoading(false);
        return;
      }

      const answer = data.answer || data.error || "Sorry, I couldn't generate a response right now.";
      setLoading(false);
      streamAssistantReply(answer, assistantIndex);
    } catch (error) {
      console.error("Assistant fetch error:", error);
      setMessages((current) =>
        current.map((message, index) =>
          index === assistantIndex
            ? {
                ...message,
                text: "Sorry — I hit a snag there. Please try again in a moment.",
                streaming: false,
              }
            : message
        )
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end md:bottom-8 md:right-8">
      {open && (
        <div className="mb-3 w-[340px] max-w-full rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-t-3xl bg-slate-950 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Danish's Assistant</p>
              <p className="text-xs text-slate-300">Powered by a small model + portfolio context.</p>
            </div>
            <button
              className="rounded-full bg-slate-800 p-2 transition-colors hover:bg-slate-700"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[340px] space-y-2 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message, index) => {
              if (message.role === "assistant" && message.text === "" && message.streaming) {
                return null;
              }
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-slate-900 ${
                      message.role === "assistant"
                        ? "bg-slate-100"
                        : "bg-primary text-white"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <FormatMessageText text={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl bg-slate-100 px-3 py-2 text-slate-900">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="border-t border-slate-200 px-4 py-3" onSubmit={handleSend}>
            <label className="sr-only" htmlFor="assistant-input">
              Ask a question
            </label>
            <div className="flex gap-2">
              <input
                id="assistant-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Danish..."
                className="min-w-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark"
        onClick={() => setOpen((current) => !current)}
        aria-label="Toggle chat assistant"
      >
        <MessageSquare size={18} />
        {open ? "Close" : "Ask me about Danish"}
      </button>
    </div>
  );
}
