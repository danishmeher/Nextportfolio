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

      // Track once per 10 minutes per browser session to avoid duplicate spam on quick refreshes
      const lastTracked = Number(sessionStorage.getItem("portfolio_last_visit_time") || "0");
      const now = Date.now();

      if (now - lastTracked > 10 * 60 * 1000) {
        sessionStorage.setItem("portfolio_last_visit_time", String(now));

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
