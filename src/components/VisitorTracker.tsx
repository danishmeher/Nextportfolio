"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    try {
      // Ensure we only track once per browser session to prevent notification spam on refresh
      const sessionKey = "portfolio_visit_tracked";
      if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");

        const payload = {
          referrer: document.referrer || "Direct",
          path: window.location.pathname || "/",
          screen: `${window.screen.width}x${window.screen.height}`,
        };

        fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch {
      // Ignore client storage errors (e.g. private mode)
    }
  }, []);

  return null;
}
