"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function AuthModal() {
  const { isModalOpen, modalMode, closeModal, login, openModal } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(modalMode);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    organization: "tenant_company",
    floor_number: "",
    unit_number: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const [registerStep, setRegisterStep] = useState<"captcha" | "form">("form");

  useEffect(() => setMode(modalMode), [modalMode]);

  useEffect(() => {
    if (!isModalOpen) return;
    setError("");
    setTurnstileError("");
    setTurnstileToken("");
    fetch("/api/auth?action=turnstile-site-key")
      .then((r) => r.json())
      .then((d) => {
        setTurnstileEnabled(!!d.turnstile_enabled);
        setSiteKey(d.site_key || "");
      })
      .catch(() => {});
  }, [isModalOpen]);

  useEffect(() => {
    // if registering and turnstile is enabled, start at captcha step
    if (modalMode === "register" && turnstileEnabled) {
      setRegisterStep("captcha");
    } else {
      setRegisterStep("form");
    }
  }, [modalMode, turnstileEnabled]);

  useEffect(() => {
    if (!turnstileEnabled || !siteKey || !widgetRef.current) return;
    if (!(window as any).turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => {
        setTurnstileError("Security check could not load. Please refresh and try again.");
      };
      document.body.appendChild(script);
    } else {
      renderWidget();
    }
    function renderWidget() {
      if (!widgetRef.current) return;
      widgetRef.current.innerHTML = "";
      (window as any).turnstile?.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileError("");
          setTurnstileToken(token);
          // when token is acquired during registration, advance to form
          if (modalMode === "register") setRegisterStep("form");
        },
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileError("Security check is unavailable for this domain. Please refresh after the site owner updates the Cloudflare Turnstile domain settings.");
        },
        "timeout-callback": () => {
          setTurnstileToken("");
          setTurnstileError("Security check timed out. Please refresh and try again.");
        },
      });
    }
  }, [turnstileEnabled, siteKey, mode, isModalOpen]);

  if (!isModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (turnstileEnabled && !turnstileToken) {
      setError(turnstileError || "Please complete the security check and try again.");
      return;
    }
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
    <div className="auth-modal-backdrop fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pb-4">
      <div className="auth-modal-panel w-full max-w-md overflow-y-auto rounded-xl border p-6 shadow-2xl theme-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-heading">{mode === "login" ? "Log In" : "Create Tenant Account"}</h2>
          <button onClick={closeModal} className="theme-muted" aria-label="Close">
            ✕
          </button>
        </div>

        {mode === "register" && (
          <div className="mb-4 rounded-md border px-3 py-2 text-sm theme-info-panel">
            Account access is for verified Marajo Tower tenants/members only. Your company and floor details will be sent for admin review.
          </div>
        )}

        {error && <div className="mb-4 rounded-md px-3 py-2 text-sm theme-error-panel">{error}</div>}

        {/* If registering and Turnstile is enabled, require captcha first */}
        {mode === "register" && turnstileEnabled && registerStep === "captcha" ? (
          <div>
            <p className="mb-3 text-sm theme-muted">Please complete the security check to continue.</p>
            <div ref={widgetRef} />
            {turnstileError && <p className="mt-2 text-sm theme-error-text">{turnstileError}</p>}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={!turnstileToken}
                onClick={() => setRegisterStep("form")}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 theme-primary-button"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="First name"
                className="rounded-md border px-3 py-2 text-sm theme-input"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <input
                placeholder="Last name"
                className="rounded-md border px-3 py-2 text-sm theme-input"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          )}
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-md border px-3 py-2 text-sm theme-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {mode === "register" && (
            <input
              placeholder="Phone (optional)"
              className="w-full rounded-md border px-3 py-2 text-sm theme-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          )}
          {mode === "register" && (
            <>
              <input
                required
                placeholder="Company name"
                className="w-full rounded-md border px-3 py-2 text-sm theme-input"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
              <input
                required
                placeholder="Floor number"
                className="w-full rounded-md border px-3 py-2 text-sm theme-input"
                value={form.floor_number}
                onChange={(e) => setForm({ ...form, floor_number: e.target.value })}
              />
            </>
          )}
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 text-sm theme-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

            {/* show inline widget for login or when captcha isn't required prior to form */}
            {turnstileEnabled && mode === "login" && <div ref={widgetRef} />}
            {turnstileEnabled && mode === "register" && registerStep === "form" && <div ref={widgetRef} />}
            {turnstileError && <p className="text-sm theme-error-text">{turnstileError}</p>}

          <button
            type="submit"
            disabled={busy || (turnstileEnabled && !turnstileToken)}
            className="w-full rounded-md py-2.5 text-sm font-semibold text-white disabled:opacity-60 theme-primary-button"
          >
            {busy ? "Please wait..." : mode === "login" ? "Log In" : "Create Tenant Account"}
          </button>
        </form>
        )}

        <p className="mt-4 text-center text-sm theme-muted">
          {mode === "login" ? (
            <>
              Are you a Marajo Tower tenant/member?{" "}
              <button className="font-semibold theme-link underline" onClick={() => openModal("register")}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-semibold theme-link underline" onClick={() => openModal("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
