"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Bot, Zap, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  streaming?: boolean;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-2" aria-label="AI Thinking">
      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
    </div>
  );
}

function FormatMessageText({ text }: { text: string }) {
  const normalizedText = text
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/(?<!\*)\*(?!\*)/g, "");
  const lines = normalizedText.split("\n");

  return (
    <div className="space-y-1.5 whitespace-pre-line wrap-break-word text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        let content: React.ReactNode = line;

        if (line.includes("**")) {
          const parts = line.split("**");
          content = parts.map((part, i) => {
            if (i % 2 === 1) {
              return (
                <strong key={i} className="font-extrabold text-indigo-300">
                  {part}
                </strong>
              );
            }
            return part;
          });
        }

        if (line.trim().startsWith("* ") || line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          const cleanLine = line.replace(/^\s*[\*\-•]\s*/, "");
          const parts = cleanLine.split("**");
          const lineContent = parts.map((part, i) => {
            if (i % 2 === 1) {
              return (
                <strong key={i} className="font-extrabold text-indigo-300">
                  {part}
                </strong>
              );
            }
            return part;
          });
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-cyan-400 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <span className="wrap-break-word">{lineContent}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="wrap-break-word">
            {content}
          </p>
        );
      })}
    </div>
  );
}

const quickPrompts = [
  "🚀 Selected Projects",
  "🛠️ Technical Stack",
  "💼 Work Experience",
  "📞 Contact Info",
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "👋 Hi! I'm Danish's AI Assistant. How can I help you today?",
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
    }, 20);
  };

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

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
                text: "Sorry — connection issue. Please try again.",
                streaming: false,
              }
            : message
        )
      );
      setLoading(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end md:bottom-8 md:right-8">
      {/* Balanced AI Popup Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-3 w-[350px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden text-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-md">
                  <Bot size={16} />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1">
                    Danish AI Assistant
                    <Zap size={12} className="text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-[10px] text-indigo-400 font-semibold">Trained Portfolio Assistant</p>
                </div>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X size={14} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="max-h-[300px] min-h-[180px] flex-1 space-y-3 overflow-y-auto p-3.5 text-xs sm:text-sm">
              {messages.map((message, index) => {
                if (message.role === "assistant" && message.text === "" && message.streaming) {
                  return null;
                }
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex items-start gap-2.5 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
                        <Bot size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        isAssistant
                          ? "bg-slate-900/90 text-slate-200 border border-indigo-500/20"
                          : "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium"
                      }`}
                    >
                      <div className="wrap-break-word">
                        {isAssistant ? (
                          <FormatMessageText text={message.text} />
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                    {!isAssistant && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mt-0.5">
                        <User size={12} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 justify-start">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Bot size={12} />
                  </div>
                  <div className="rounded-2xl bg-slate-900 border border-indigo-500/20 px-3 py-1.5">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (ONLY shown on initial greeting message, hidden after user asks question) */}
            {messages.length === 1 && (
              <div className="px-3.5 py-2 border-t border-indigo-500/10 bg-slate-950/60">
                <p className="text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form className="border-t border-indigo-500/20 bg-slate-950 p-2.5" onSubmit={handleFormSubmit}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask a quick question..."
                  className="min-w-0 flex-1 rounded-full border border-indigo-500/30 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md transition-all ${
                    loading || !input.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  aria-label="Send message"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4.5 py-3 text-xs font-black text-white shadow-2xl shadow-indigo-500/30 border border-indigo-400/40 backdrop-blur-xl"
        onClick={() => setOpen((current) => !current)}
        aria-label="Toggle AI Assistant"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
        </span>
        <Bot size={16} className="text-cyan-300" />
        <span>{open ? "Close Assistant" : "Ask Danish AI"}</span>
      </motion.button>
    </div>
  );
}
