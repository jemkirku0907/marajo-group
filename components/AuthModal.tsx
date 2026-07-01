"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function AuthModal() {
  const { isModalOpen, modalMode, closeModal, login, openModal } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(modalMode);
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMode(modalMode), [modalMode]);

  useEffect(() => {
    if (!isModalOpen) return;
    setError("");
    fetch("/api/auth?action=turnstile-site-key")
      .then((r) => r.json())
      .then((d) => {
        setTurnstileEnabled(!!d.turnstile_enabled);
        setSiteKey(d.site_key || "");
      })
      .catch(() => {});
  }, [isModalOpen]);

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
  }, [turnstileEnabled, siteKey, mode, isModalOpen]);

  if (!isModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const action = mode === "login" ? "login" : "register";
      const res = await fetch(`/api/auth?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstile_token: turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      login(data.token, data.user);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{mode === "login" ? "Log In" : "Create Account"}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="First name"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <input
                placeholder="Last name"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          )}
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {mode === "register" && (
            <input
              placeholder="Phone (optional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          )}
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {turnstileEnabled && <div ref={widgetRef} />}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-[#1a1a2e] py-2.5 text-sm font-semibold text-white hover:bg-[#252548] disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button className="font-semibold text-[#1a1a2e] underline" onClick={() => openModal("register")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-[#1a1a2e] underline" onClick={() => openModal("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
