"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const pathname = window.location.pathname || "/";
      // Do not track visits to admin or login panel
      if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
        return;
      }

      // Ensure we only track once per browser session to prevent spam on every refresh
      const sessionKey = "portfolio_visit_tracked";
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");

        const payload = {
          referrer: document.referrer || "Direct",
          path: pathname,
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
