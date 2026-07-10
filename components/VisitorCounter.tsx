"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "marajo_visitor_session";
const HEARTBEAT_MS = 25000;

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const next = createSessionId();
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return createSessionId();
  }
}

export default function VisitorCounter({ variant = "fixed" }: { variant?: "fixed" | "inline" }) {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getSessionId();

    async function heartbeat() {
      try {
        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, path: pathname || "/" }),
          cache: "no-store",
          keepalive: true,
        });
        const data = await res.json();
        if (!cancelled && data?.success) {
          setCount(Number(data.count || 0));
          setIsOnline(true);
        }
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    }

    heartbeat();
    const timer = window.setInterval(heartbeat, HEARTBEAT_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") heartbeat();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  if (!isOnline || count === null) return null;

  const label = count === 1 ? "person viewing now" : "people viewing now";

  return (
    <aside className={`visitor-counter visitor-counter--${variant}`} aria-live="polite" aria-label={`${count} ${label}`}>
      <span className="visitor-counter-dot" aria-hidden="true" />
      <strong>{count}</strong>
      <span>{label}</span>
    </aside>
  );
}
