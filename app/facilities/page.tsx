"use client";

import { useState } from "react";
import { useAuth, authHeaders } from "@/lib/AuthContext";

const STEPS = ["Check Availability", "Your Details", "Confirmation"];
const mobileLabels = ["Availability", "Details", "Confirm"];

function fmtPeso(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  let s = new Date(`2026-01-01T${start}`).getTime();
  let e = new Date(`2026-01-01T${end}`).getTime();
  if (e <= s) e += 86400000;
  return Math.max(1, Math.round(((e - s) / 3600000) * 100) / 100);
}

export default function FacilitiesPage() {
  const { token, requireLogin } = useAuth();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("10:00");

  const [availBadge, setAvailBadge] = useState<"Available" | "Booked">("Available");
  const [availMsg, setAvailMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checked, setChecked] = useState<{ date: string; start: string; end: string } | null>(null);

  const [form, setForm] = useState({ full_name: "", contact_number: "", email: "", notes: "" });
  const [bookMsg, setBookMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const hours = calcHours(start, end);
  const previewBase = hours * 1000;

  function goTo(i: number) {
    setStep(i);
  }

  async function checkAvailability(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !start || !end) {
      setAvailMsg({ text: "Please fill in all fields.", ok: false });
      return;
    }
    if (!requireLogin()) return;
    setAvailMsg(null);
    setBusy(true);
    try {
      const params = new URLSearchParams({ action: "availability", booking_date: date, start_time: start, end_time: end });
      const res = await fetch(`/api/facilities?${params}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) {
        setAvailMsg({ text: data.message || "Error checking availability.", ok: false });
        return;
      }
      setIsAvailable(!!data.available);
      setAvailBadge(data.available ? "Available" : "Booked");
      if (data.available) {
        setChecked({ date, start, end });
        setAvailMsg({ text: "✓ The court is available! Proceed to Step 2 to complete your booking.", ok: true });
        setTimeout(() => goTo(1), 500);
      } else {
        setAvailMsg({ text: "✗ The court is already booked during that time. Please choose a different slot.", ok: false });
      }
    } catch {
      setAvailMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!isAvailable || !checked) {
      setBookMsg({ text: "Please go back to Step 1 and confirm the court is available first.", ok: false });
      return;
    }
    setBookMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/facilities?action=book", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ booking_date: checked.date, start_time: checked.start, end_time: checked.end, ...form }),
      });
      const data = await res.json();
      if (!data.success) {
        setIsAvailable(false);
        setAvailBadge("Booked");
        setBookMsg({ text: "✗ " + (data.message || "Booking failed. Please re-check availability."), ok: false });
        setTimeout(() => goTo(0), 2000);
        return;
      }
      setResult(data);
      goTo(2);
    } catch {
      setBookMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  function downloadReceipt() {
    if (!result || !checked) return;
    const lines = [
      "MARAJO TOWER — COURT BOOKING RECEIPT",
      `Reference: FAC-${result.booking_id}`,
      `Court: Multi-Purpose Court`,
      `Date: ${checked.date}`,
      `Time: ${checked.start} – ${checked.end}`,
      `Total Fee: ${fmtPeso(result.fee ?? 0)}`,
      "Payment: Collected on-site",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FAC-${result.booking_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bookAnother() {
    setStep(0);
    setIsAvailable(false);
    setChecked(null);
    setResult(null);
    setAvailMsg(null);
    setBookMsg(null);
    setForm({ full_name: "", contact_number: "", email: "", notes: "" });
  }

  const stepIcons = [
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  ];

  return (
    <main className="booking-page">
      {/* Hero */}
      <section className="platform-hero">
        <div className="container platform-hero-grid">
          <div>
            <span className="platform-eyebrow">Marajo Tower Court Booking</span>
            <h1>Reserve the multi-purpose court by the hour — instantly confirmed.</h1>
            <p>Check availability for your preferred date and time. If the court is free, fill in your details and get an instant confirmation with a receipt emailed to you.</p>
            <div className="platform-hero-actions">
              <a href="#reserve" className="btn-primary">Book the Court</a>
              <a href="#reserve" className="btn-secondary">Check Availability</a>
            </div>
          </div>
          <div className="platform-preview">
            <img src="/assets/marajo-tower.jpg" alt="Marajo Tower" />
            <div className="platform-status-strip">
              <div><strong>₱1000</strong><span>Per hour</span></div>
              <div><strong>1</strong><span>Court</span></div>
              <div><strong>Instant</strong><span>Confirmation</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="reserve" className="booking-section">
        <div className="container">

          <nav className="booking-steps" role="tablist" aria-label="Court booking steps">
            {STEPS.map((label, i) => (
              <button
                key={label}
                className={`booking-step-btn${step === i ? " active" : ""}`}
                role="tab"
                aria-selected={step === i}
                onClick={() => goTo(i)}
                type="button"
              >
                <span className="booking-step-num">{i + 1}</span>
                {stepIcons[i]}
                {label}
              </button>
            ))}
          </nav>

          <div className="wf-tab-bar" role="tablist">
            {mobileLabels.map((label, i) => (
              <button key={label} className={`wf-tab${step === i ? " active" : ""}`} role="tab" aria-selected={step === i} onClick={() => goTo(i)} type="button">
                {label}
              </button>
            ))}
          </div>

          <div className="wf-track">

            {/* PANEL 0 — Check Availability */}
            <div className={`wf-panel${step === 0 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <h2>Check Availability</h2>
                    <span className="header-badge">Step 1</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={checkAvailability}>
                      <p className="form-section-label">Date &amp; Time</p>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="booking_date">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Booking Date
                          </label>
                          <div className="form-input-wrap">
                            <input id="booking_date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <div className="form-field">
                          <label className="form-label" htmlFor="start_time">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Start Time
                          </label>
                          <div className="form-input-wrap">
                            <input id="start_time" type="time" required value={start} onChange={(e) => setStart(e.target.value)} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="end_time">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            End Time
                          </label>
                          <div className="form-input-wrap">
                            <input id="end_time" type="time" required value={end} onChange={(e) => setEnd(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-secondary" type="submit" disabled={busy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        {busy ? "Checking…" : "Check if Court is Available"}
                      </button>
                    </form>
                    {availMsg && (
                      <div className="booking-message platform-message is-visible" style={{ background: availMsg.ok ? "rgba(22,163,74,.08)" : "rgba(220,38,38,.08)", color: availMsg.ok ? "#15803d" : "#b91c1c" }}>
                        {availMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Fee Preview</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-icon">
                      <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 36H44V12H4V36H24ZM24 36V28M24 12V20" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="24" cy="24" r="4" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 24C11 26.2091 9.20914 28 7 28H4V20H7C9.20914 20 11 21.7909 11 24Z" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M37 24C37 26.2091 38.7909 28 41 28H44V20H41C38.7909 20 37 21.7909 37 24Z" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="summary-property-info">
                      <strong>Multi-Purpose Court</strong>
                      <span>Marajo Tower, BGC</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span className="summary-row-label">Court</span>
                      <span className="summary-row-value"><span className="status-pill">{availBadge}</span></span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Duration</span>
                      <span className="summary-row-value">{hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "—"}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-row-label">Court Fee</span>
                      <span className="summary-row-value">{fmtPeso(previewBase)}</span>
                    </div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">Total Amount</span>
                    <span className="value">{fmtPeso(previewBase)}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>Rate Guide</strong>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>₱1000 / hour</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Minimum 1 hour booking</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Payment collected on-site</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Email receipt sent instantly</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 1 — Your Details */}
            <div className={`wf-panel${step === 1 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <h2>Your Details</h2>
                    <span className="header-badge">Step 2</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={book}>
                      <p className="form-section-label">Contact Information</p>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="full_name">Full Name</label>
                          <div className="form-input-wrap">
                            <input id="full_name" placeholder="Juan dela Cruz" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="contact_number">Contact Number</label>
                          <div className="form-input-wrap">
                            <input id="contact_number" placeholder="09XXXXXXXXX" required value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="booker_email">Email Address</label>
                          <div className="form-input-wrap">
                            <input id="booker_email" type="email" placeholder="you@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label" style={{ marginTop: "1.1rem" }}>Notes <small style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</small></p>
                      <div className="field-group single">
                        <div className="form-field">
                          <div className="form-input-wrap no-icon">
                            <textarea placeholder="e.g. Basketball training · 5 players · Need ball pump" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-primary" type="submit" disabled={busy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {busy ? "Booking…" : "Confirm Court Booking"}
                      </button>
                    </form>
                    {bookMsg && (
                      <div className="booking-message platform-message is-visible" style={{ background: bookMsg.ok ? "rgba(22,163,74,.08)" : "rgba(220,38,38,.08)", color: bookMsg.ok ? "#15803d" : "#b91c1c" }}>
                        {bookMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Booking Summary</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>Multi-Purpose Court</strong>
                      <span>{checked ? `${checked.date} · ${checked.start} – ${checked.end}` : "—"}</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Date</span><span className="summary-row-value">{checked?.date ?? "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Time</span><span className="summary-row-value">{checked ? `${checked.start} – ${checked.end}` : "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Duration</span><span className="summary-row-value">{hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Court Fee</span><span className="summary-row-value">{fmtPeso(previewBase)}</span></div>
                  </div>
                  <div className="summary-total-row">
                    <span className="label">Total Amount</span>
                    <span className="value">{fmtPeso(previewBase)}</span>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>What happens next</strong>
                      After confirming, you'll receive an email receipt immediately. Payment is collected at the court on your booking day.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2 — Confirmation */}
            <div className={`wf-panel${step === 2 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-card" style={{ maxWidth: 640, margin: "0 auto" }}>
                <div className="booking-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <h2>{result ? "Booking Confirmed!" : "Confirmation"}</h2>
                  {result && <span className="header-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16a34a", borderColor: "rgba(22,163,74,.25)" }}>Instant Confirm</span>}
                </div>
                <div className="booking-card-body" style={{ textAlign: "center" }}>
                  {!result ? (
                    <p style={{ fontSize: ".9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      Complete steps 1–2 to check availability and submit your details. Your confirmation and receipt will appear here.
                    </p>
                  ) : (
                    <>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".5rem" }}>Your court is reserved!</h3>
                      <p style={{ fontSize: ".95rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Reference: FAC-{result.booking_id}</p>

                      <div style={{ background: "var(--section-alt, rgba(242,253,245,.95))", border: "1px solid var(--border-muted, rgba(13,13,13,.08))", borderRadius: ".75rem", padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Court</span><strong>Multi-Purpose Court</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Date</span><strong>{checked?.date ?? "—"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".4rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Time</span><strong>{checked ? `${checked.start} – ${checked.end}` : "—"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".4rem 0" }}>
                          <span style={{ color: "var(--text-muted)" }}>Total Fee</span>
                          <strong style={{ color: "var(--mg-green)", fontSize: "1.05rem" }}>{fmtPeso(result.fee ?? 0)}</strong>
                        </div>
                      </div>

                      <p style={{ fontSize: ".84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>A receipt has been sent to your email. Present your reference number at the court entrance. Payment is collected on-site.</p>

                      <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
                        <button onClick={downloadReceipt} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".75rem 1.75rem" }}>💾 Download Receipt</button>
                        <button onClick={bookAnother} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".75rem 1.75rem" }}>Book Another Slot</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="wf-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`wf-dot${step === i ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
