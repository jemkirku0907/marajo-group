"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeController from "@/components/ThemeController";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/auth?action=turnstile-site-key")
      .then((res) => res.json())
      .then((data) => {
        const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
        setTurnstileEnabled(!!data.turnstile_enabled && !isLocalHost);
        setSiteKey(data.site_key || "");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!turnstileEnabled || !siteKey || !widgetRef.current) return;
    if (!(window as any).turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (!widgetRef.current) return;
      widgetRef.current.innerHTML = "";
      (window as any).turnstile?.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => setTurnstileToken(token),
      });
    }
  }, [turnstileEnabled, siteKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 20% 0%, var(--mg-lime-soft), transparent 28rem), var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <div className="admin-theme-control" aria-label="Theme controls">
        <ThemeController />
      </div>
      <div
        style={{
          background: "var(--surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-muted)",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "var(--shadow-lg, 0 20px 60px rgba(0,0,0,.25))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Marajo Group" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 17, color: "var(--heading-color)" }}>Marajo Group</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Staff Portal</p>
          </div>
        </div>
        <h2 style={{ fontSize: 20, color: "var(--heading-color)", marginBottom: 6 }}>Sign in</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          Use your staff account to access the dashboard.
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--heading-color)", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--heading-color)", marginBottom: 6 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {turnstileEnabled && <div ref={widgetRef} style={{ marginBottom: 18 }} />}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: loading ? "var(--accent-soft)" : "#1f6e34",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid var(--border-muted)",
  borderRadius: 8,
  fontSize: 14,
  marginBottom: 18,
  outline: "none",
  background: "var(--surface)",
  color: "var(--text-primary)",
};
