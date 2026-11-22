/**
 * Unified Real-Time Notification Service
 * Supports Telegram Bot and Discord Webhook for instant mobile alerts.
 */

export interface VisitorInfo {
  ip?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  path?: string;
  screen?: string;
}

export interface AiChatInfo {
  question: string;
  answer?: string;
  device?: string;
  ip?: string;
}

/**
 * Format and send an alert to Telegram (and/or Discord if configured).
 */
export async function sendRealtimeNotification(text: string, htmlMessage?: string): Promise<void> {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL?.trim();

  const promises: Promise<any>[] = [];

  // 1. Send to Telegram if configured
  if (telegramToken && telegramChatId) {
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const payload = {
      chat_id: telegramChatId,
      text: htmlMessage || text,
      parse_mode: htmlMessage ? "HTML" : "Markdown",
      disable_web_page_preview: true,
    };

    promises.push(
      fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("[Notifier] Telegram send failed:", err?.message || err);
      })
    );
  }

  // 2. Send to Discord Webhook if configured
  if (discordWebhook) {
    promises.push(
      fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      }).catch((err) => {
        console.error("[Notifier] Discord send failed:", err?.message || err);
      })
    );
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
}

/**
 * Notify when a new visitor lands on the portfolio
 */
export async function notifyVisitor(info: VisitorInfo): Promise<void> {
  const timeStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
  });

  const location = [info.city, info.country].filter(Boolean).join(", ") || "Unknown Location";
  const source = info.referrer ? (info.referrer.includes(process.env.NEXT_PUBLIC_BASE_URL || "") ? "Direct Navigation" : info.referrer) : "Direct Visit";
  const device = [info.device, info.os, info.browser].filter(Boolean).join(" • ") || "Unknown Device";

  const plainText = `🚀 New Portfolio Visitor!
📍 Location: ${location}
📱 Device: ${device}
🔗 Source: ${source}
⏰ Time: ${timeStr} PKT`;

  const htmlText = `🚀 <b>New Portfolio Visitor!</b>
📍 <b>Location:</b> ${location}
📱 <b>Device:</b> ${device}
🔗 <b>Source:</b> ${source}
⏰ <b>Time:</b> ${timeStr} PKT`;

  await sendRealtimeNotification(plainText, htmlText);
}

/**
 * Notify when a visitor interacts with the AI Assistant
 */
export async function notifyAiChat(info: AiChatInfo): Promise<void> {
  const timeStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const plainText = `💬 AI Assistant Chat!
❓ Question: "${info.question}"
🤖 Answer: ${info.answer ? `"${info.answer.slice(0, 200)}${info.answer.length > 200 ? "..." : ""}"` : "(Processing...)"}
📱 Device: ${info.device || "Visitor"}
⏰ Time: ${timeStr} PKT`;

  const htmlText = `💬 <b>AI Assistant Inquiry!</b>
❓ <b>Question:</b> <i>"${escapeHtml(info.question)}"</i>
${
  info.answer
    ? `🤖 <b>Answer:</b> <i>"${escapeHtml(info.answer.slice(0, 250))}${info.answer.length > 250 ? "..." : ""}"</i>\n`
    : ""
}📱 <b>Device:</b> ${escapeHtml(info.device || "Visitor")}
⏰ <b>Time:</b> ${timeStr} PKT`;

  await sendRealtimeNotification(plainText, htmlText);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
