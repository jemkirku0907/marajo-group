"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        background: "#0f0f1e",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Marajo Group" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 17, color: "#111827" }}>Marajo Group</h1>
            <p style={{ fontSize: 12, color: "#6b7280" }}>Staff Portal</p>
          </div>
        </div>
        <h2 style={{ fontSize: 20, color: "#111827", marginBottom: 6 }}>Sign in</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
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
          <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
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
          <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
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
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: loading ? "#86efac" : "#16a34a",
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
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  marginBottom: 18,
  outline: "none",
};
