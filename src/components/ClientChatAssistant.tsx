"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), {
  ssr: false,
});

export default function ClientChatAssistant() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    let idleId: number | ReturnType<typeof setTimeout>;
    if ("requestIdleCallback" in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => {
        setShouldLoad(true);
      });
    } else {
      idleId = setTimeout(() => {
        setShouldLoad(true);
      }, 1500);
    }

    return () => {
      if ("cancelIdleCallback" in window && typeof idleId === "number") {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  if (!shouldLoad) return null;

  return <ChatAssistant />;
}
