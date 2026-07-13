"use client";

import { useEffect, useState } from "react";
import { useAuth, authHeaders } from "@/lib/AuthContext";

const POSITIONS = [
  ["janitor", "Janitor"],
  ["utility_worker", "Utility Worker"],
  ["maintenance_staff", "Maintenance Staff"],
  ["electrician", "Electrician"],
  ["plumber", "Plumber"],
  ["security_personnel", "Security Personnel"],
  ["technician", "Technician"],
];

const STEPS = ["Browse Workers", "Book a Shift", "Workflow", "My Assignments", "What's Included"];
const mobileLabels = ["Browse", "Book", "Workflow", "Assigned", "Inclusions"];

type Worker = {
  id: number;
  name: string;
  position: string;
  experience_years: number;
  skills: string[];
  rating: number;
  verification_status: string;
  availability_status?: string;
  contact_number?: string;
  email?: string;
};

type BookForm = {
  position: string;
  slots_needed: number;
  job_date: string;
  shift_start: string;
  shift_end: string;
  client_name: string;
  contact_number: string;
  email: string;
  notes: string;
};

type WorkerAssignment = {
  id: number;
  client_name: string;
  contact_number?: string;
  email?: string;
  position: string;
  slots_needed: number;
  job_date: string;
  shift_start: string;
  shift_end: string;
  notes?: string;
  admin_notes?: string;
  status: string;
  status_label: string;
  current_status_age: string;
  total_elapsed: string;
};

function roleLabel(value: string) {
  const found = POSITIONS.find((p) => p[0] === value);
  return found ? found[1] : "—";
}

export default function WorkforcePage() {
  const { token, requireLogin } = useAuth();

  const [step, setStep] = useState(0);

  // Browse
  const [browsePosition, setBrowsePosition] = useState("");
  const [browseDate, setBrowseDate] = useState("");
  const [workers, setWorkers] = useState<Worker[] | null>(null);
  const [browseBusy, setBrowseBusy] = useState(false);
  const [browseError, setBrowseError] = useState("");

  // Book
  const [form, setForm] = useState<BookForm>({
    position: "",
    slots_needed: 1,
    job_date: "",
    shift_start: "08:00",
    shift_end: "17:00",
    client_name: "",
    contact_number: "",
    email: "",
    notes: "",
  });
  const [bookBusy, setBookBusy] = useState(false);
  const [bookError, setBookError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentWorker, setAssignmentWorker] = useState<any>(null);
  const [activeAssignments, setActiveAssignments] = useState<WorkerAssignment[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<WorkerAssignment[]>([]);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<number | null>(null);

  function goTo(i: number) {
    setStep(i);
  }

  async function loadAssignments() {
    if (!token) {
      setAssignmentWorker(null);
      setActiveAssignments([]);
      setCompletedAssignments([]);
      return;
    }
    setAssignmentLoading(true);
    setAssignmentError("");
    try {
      const res = await fetch("/api/worker/tasks", { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) {
        setAssignmentError(data.message || "Could not load assignments.");
        setAssignmentWorker(null);
        setActiveAssignments([]);
        setCompletedAssignments([]);
        return;
      }
      setAssignmentWorker(data.worker || null);
      setActiveAssignments(data.active || []);
      setCompletedAssignments(data.completed || []);
    } catch {
      setAssignmentError("Network error. Please try again.");
    } finally {
      setAssignmentLoading(false);
    }
  }

  useEffect(() => {
    if (step === 3) {
      loadAssignments();
    }
  }, [step, token]);

  async function updateAssignment(id: number, status: "accepted" | "in_progress" | "done" | "declined") {
    if (!requireLogin()) return;
    setUpdatingAssignmentId(id);
    setAssignmentError("");
    try {
      const res = await fetch("/api/worker/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.success) {
        setAssignmentError(data.message || "Could not update assignment.");
        return;
      }
      loadAssignments();
    } catch {
      setAssignmentError("Network error. Please try again.");
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  async function findWorkers(e: React.FormEvent) {
    e.preventDefault();
    setBrowseError("");
    setBrowseBusy(true);
    try {
      const params = new URLSearchParams({ action: "available-workers" });
      if (browsePosition) params.set("position", browsePosition);
      if (browseDate) params.set("shift_date", browseDate);
      const res = await fetch(`/api/workers?${params}`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) {
        setBrowseError(data.message || "Could not load workers.");
        return;
      }
      setWorkers(data.workers);
      if (browsePosition) setForm((f) => ({ ...f, position: browsePosition }));
      if (browseDate) setForm((f) => ({ ...f, job_date: browseDate }));
      goTo(1);
    } catch {
      setBrowseError("Network error. Please try again.");
    } finally {
      setBrowseBusy(false);
    }
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setBookError("");
    setBookBusy(true);
    try {
      const res = await fetch("/api/workers?action=book", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setBookError(data.message || "Booking failed.");
        return;
      }
      setResult(data);
      goTo(2);
    } catch {
      setBookError("Network error. Please try again.");
    } finally {
      setBookBusy(false);
    }
  }

  function downloadReceipt() {
    if (!result) return;
    const lines = [
      "MARAJO TOWER — WORKFORCE BOOKING RECEIPT",
      `Reference: WF-${result.booking_id}`,
      `Client: ${form.client_name}`,
      `Contact: ${form.contact_number}`,
      `Email: ${form.email}`,
      `Role Needed: ${roleLabel(form.position)}`,
      `No. of Workers: ${form.slots_needed}`,
      `Shift Date: ${form.job_date}`,
      `Shift Hours: ${form.shift_start} – ${form.shift_end}`,
      "Status: Pending Admin Approval",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WF-${result.booking_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function newBooking() {
    setStep(0);
    setResult(null);
    setBookError("");
    setForm({
      position: "",
      slots_needed: 1,
      job_date: "",
      shift_start: "08:00",
      shift_end: "17:00",
      client_name: "",
      contact_number: "",
      email: "",
      notes: "",
    });
  }

  function assignmentCard(assignment: WorkerAssignment, mode: "active" | "completed") {
    const canRespond = assignment.status === "pending_response";
    const canDecline = assignment.status === "pending_response" || assignment.status === "accepted";
    const canStart = assignment.status === "accepted";
    const canFinish = assignment.status === "in_progress";
    return (
      <article key={assignment.id} className="worker-assignment-card">
        <div className="worker-assignment-main">
          <div>
            <span className={`status-pill${assignment.status === "in_progress" ? " warn" : ""}`}>
              {assignment.status_label}
            </span>
            <h3>{roleLabel(assignment.position)}</h3>
            <p>{assignment.client_name || "Unnamed client"} · {assignment.slots_needed || 1} worker(s)</p>
          </div>
          <div className="worker-assignment-ref">WF-{assignment.id}</div>
        </div>
        <div className="worker-assignment-grid">
          <div><span>Date</span><strong>{assignment.job_date ? new Date(assignment.job_date).toLocaleDateString() : "No date"}</strong></div>
          <div><span>Shift</span><strong>{[assignment.shift_start, assignment.shift_end].filter(Boolean).join(" - ") || "No time"}</strong></div>
          <div><span>Contact</span><strong>{assignment.contact_number || assignment.email || "No contact"}</strong></div>
          <div><span>Time</span><strong>{assignment.current_status_age}</strong></div>
        </div>
        {(assignment.notes || assignment.admin_notes) && (
          <div className="worker-assignment-notes">
            {assignment.admin_notes && <p><strong>Admin note:</strong> {assignment.admin_notes}</p>}
            {assignment.notes && <p><strong>Client note:</strong> {assignment.notes}</p>}
          </div>
        )}
        {mode === "active" && (
          <div className="worker-assignment-actions">
            <button
              type="button"
              className="btn-book-secondary"
              disabled={!canDecline || updatingAssignmentId === assignment.id}
              onClick={() => updateAssignment(assignment.id, "declined")}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn-book-primary"
              disabled={!canRespond || updatingAssignmentId === assignment.id}
              onClick={() => updateAssignment(assignment.id, "accepted")}
            >
              Accept
            </button>
            <button
              type="button"
              className="btn-book-secondary"
              disabled={!canStart || updatingAssignmentId === assignment.id}
              onClick={() => updateAssignment(assignment.id, "in_progress")}
            >
              Start Job
            </button>
            <button
              type="button"
              className="btn-book-primary"
              disabled={!canFinish || updatingAssignmentId === assignment.id}
              onClick={() => updateAssignment(assignment.id, "done")}
            >
              Mark Done
            </button>
          </div>
        )}
        {mode === "completed" && (
          <div className="worker-assignment-total">Completed in {assignment.total_elapsed}</div>
        )}
      </article>
    );
  }

  const stepIcons = [
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    <svg key="3" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    <svg key="4" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  ];

  return (
    <main className="booking-page">
      {/* Hero */}
      <section className="platform-hero">
        <div className="container platform-hero-grid">
          <div>
            <span className="platform-eyebrow">Marajo Workforce Booking</span>
            <h1>Book verified building staff for any shift, any role.</h1>
            <p>Browse available janitors, maintenance staff, electricians, plumbers, security personnel, and more. Pick a date, choose your workers, and confirm your booking in minutes.</p>
            <div className="platform-hero-actions">
              <a href="#wf-section" className="btn-primary">Browse Workers</a>
              <a href="#wf-section" className="btn-secondary">Book a Shift</a>
            </div>
          </div>
          <div className="platform-preview">
            <img src="/assets/Space-Solution-A.jpg" alt="Marajo office service area" />
            <div className="platform-status-strip">
              <div><strong>7</strong><span>Roles</span></div>
              <div><strong>Hourly</strong><span>Pay support</span></div>
              <div><strong>Daily</strong><span>Shift rates</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking section */}
      <section id="wf-section" className="booking-section">
        <div className="container">

          <nav className="booking-steps" role="tablist" aria-label="Workforce booking steps">
            {STEPS.map((label, i) => (
              <button key={label} className={`booking-step-btn${step === i ? " active" : ""}`} role="tab" aria-selected={step === i} onClick={() => goTo(i)} type="button">
                <span className="booking-step-num">{i + 1}</span>
                {stepIcons[i]}
                {label === "What's Included" ? <>What&apos;s Included</> : label}
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

            {/* PANEL 0 — Browse Workers */}
            <div className={`wf-panel${step === 0 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <h2>Browse Available Workers</h2>
                    <span className="header-badge">Live Directory</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={findWorkers}>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="browse_position">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                            Role / Position
                          </label>
                          <div className="form-input-wrap">
                            <select id="browse_position" value={browsePosition} onChange={(e) => setBrowsePosition(e.target.value)}>
                              <option value="">All Roles</option>
                              {POSITIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="browse_date">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Shift Date
                          </label>
                          <div className="form-input-wrap">
                            <input id="browse_date" type="date" value={browseDate} onChange={(e) => setBrowseDate(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <button className="btn-book-secondary" type="submit" disabled={browseBusy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        {browseBusy ? "Searching…" : "Find Available Workers"}
                      </button>
                    </form>
                    {browseError && <div className="booking-message platform-message is-visible" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626" }}>{browseError}</div>}

                    <div className="panel-table-wrap">
                      <table id="workers-table" className="platform-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Experience</th>
                            <th>Skills</th>
                            <th>Rating</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!workers ? (
                            <tr><td colSpan={6} style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem 0", fontSize: ".88rem" }}>Filter above to load available workers.</td></tr>
                          ) : workers.length === 0 ? (
                            <tr><td colSpan={6} style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem 0", fontSize: ".88rem" }}>No available workers match that filter.</td></tr>
                          ) : (
                            workers.map((w) => (
                              <tr key={w.id}>
                                <td>{w.name}</td>
                                <td>{roleLabel(w.position)}</td>
                                <td>{w.experience_years} yr{w.experience_years === 1 ? "" : "s"}</td>
                                <td>{Array.isArray(w.skills) && w.skills.length ? w.skills.join(", ") : "—"}</td>
                                <td>{w.rating ? `★ ${Number(w.rating).toFixed(1)}` : "—"}</td>
                                <td><span className="status-pill">{w.availability_status || "available"}</span></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <button className="btn-next-step" onClick={() => goTo(1)} type="button">
                      Ready to book? Go to Book a Shift →
                    </button>
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Workforce Info</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="summary-property-info">
                      <strong>Verified Building Staff</strong>
                      <span>7 available roles · BGC, Taguig</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Minimum Shift</span><span className="summary-row-value">4 hours</span></div>
                    <div className="summary-row"><span className="summary-row-label">Rate Type</span><span className="summary-row-value">Hourly / Daily</span></div>
                    <div className="summary-row"><span className="summary-row-label">Identity Check</span><span className="summary-row-value"><span className="status-pill">Verified</span></span></div>
                    <div className="summary-row"><span className="summary-row-label">Admin Approval</span><span className="summary-row-value"><span className="status-pill warn">Required</span></span></div>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>Available Roles</strong>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Janitor · Utility Worker · Maintenance</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Electrician · Plumber · Technician</span></div>
                      <div className="info-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg><span>Security Personnel</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 1 — Book a Shift */}
            <div className={`wf-panel${step === 1 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-columns">
                <div className="booking-card">
                  <div className="booking-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <h2>Book a Worker</h2>
                    <span className="header-badge">Step 2</span>
                  </div>
                  <div className="booking-card-body">
                    <form onSubmit={submitBooking}>
                      <p className="form-section-label">Client Information</p>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="client_name">Your Name / Company</label>
                          <div className="form-input-wrap">
                            <input id="client_name" placeholder="Juan dela Cruz / ABC Corp" required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="wf_contact">Contact Number</label>
                          <div className="form-input-wrap">
                            <input id="wf_contact" placeholder="09XXXXXXXXX" required value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="wf_email">Email Address</label>
                          <div className="form-input-wrap">
                            <input id="wf_email" type="email" placeholder="you@email.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <p className="form-section-label" style={{ marginTop: "1.1rem" }}>Shift Details</p>
                      <div className="field-group">
                        <div className="form-field">
                          <label className="form-label" htmlFor="wf_position">Role Needed</label>
                          <div className="form-input-wrap">
                            <select id="wf_position" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                              <option value="">Select a role…</option>
                              {POSITIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="slots_needed">No. of Workers</label>
                          <div className="form-input-wrap">
                            <input id="slots_needed" type="number" min={1} max={20} required value={form.slots_needed} onChange={(e) => setForm({ ...form, slots_needed: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group triple">
                        <div className="form-field">
                          <label className="form-label" htmlFor="job_date">Shift Date</label>
                          <div className="form-input-wrap">
                            <input id="job_date" type="date" required value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="shift_start">Start Time</label>
                          <div className="form-input-wrap">
                            <input id="shift_start" type="time" required value={form.shift_start} onChange={(e) => setForm({ ...form, shift_start: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label" htmlFor="shift_end">End Time</label>
                          <div className="form-input-wrap">
                            <input id="shift_end" type="time" required value={form.shift_end} onChange={(e) => setForm({ ...form, shift_end: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="field-group single">
                        <div className="form-field">
                          <label className="form-label" htmlFor="wf_notes">
                            Special Instructions <small style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: ".25rem" }}>(optional)</small>
                          </label>
                          <div className="form-input-wrap icon-top no-icon">
                            <textarea id="wf_notes" placeholder="e.g. bring own tools, report to lobby guard desk" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <button className="btn-book-primary" type="submit" disabled={bookBusy}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {bookBusy ? "Submitting…" : "Request Booking"}
                      </button>
                    </form>
                    {bookError && <div className="booking-message platform-message is-visible" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626" }}>{bookError}</div>}
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-header"><h3>Booking Summary</h3></div>
                  <div className="summary-property">
                    <div className="summary-property-info">
                      <strong>{form.position ? roleLabel(form.position) : "Selected Worker"}</strong>
                      <span>Assigned after admin approval</span>
                    </div>
                  </div>
                  <div className="summary-rows">
                    <div className="summary-row"><span className="summary-row-label">Role</span><span className="summary-row-value">{form.position ? roleLabel(form.position) : "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Workers</span><span className="summary-row-value">{form.slots_needed || 1}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Shift Date</span><span className="summary-row-value">{form.job_date || "—"}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Shift Hours</span><span className="summary-row-value">{form.shift_start} – {form.shift_end}</span></div>
                    <div className="summary-row"><span className="summary-row-label">Status</span><span className="summary-row-value"><span className="status-pill warn">Pending Approval</span></span></div>
                  </div>
                  <div className="summary-footer">
                    <div className="info-box">
                      <strong>How it works</strong>
                      Submit your request and our admin team will confirm availability and assign the best-matched worker within 24 hours. You&apos;ll receive an email with the worker&apos;s details.
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
                  <h2>{result ? "Request Submitted!" : "Workflow"}</h2>
                  {result && <span className="header-badge" style={{ background: "rgba(234,179,8,.12)", color: "#92400e", borderColor: "rgba(234,179,8,.3)" }}>Pending Approval</span>}
                </div>
                <div className="booking-card-body" style={{ textAlign: "center" }}>
                  {!result ? (
                    <p style={{ fontSize: ".9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      Complete steps 1–2 to browse workers and submit a shift request. Your confirmation will appear here once submitted.
                    </p>
                  ) : (
                    <>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".5rem" }}>Your booking request is in!</h3>
                      <p style={{ fontSize: ".95rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Reference: WF-{result.booking_id}</p>

                      <div style={{ background: "var(--section-alt, rgba(242,253,245,.95))", border: "1px solid var(--border-muted, rgba(13,13,13,.08))", borderRadius: ".75rem", padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                        {[
                          ["Client", form.client_name || "—"],
                          ["Contact", form.contact_number || "—"],
                          ["Email", form.email || "—"],
                          ["Role Needed", roleLabel(form.position)],
                          ["No. of Workers", String(form.slots_needed || 1)],
                          ["Shift Date", form.job_date || "—"],
                          ["Shift Hours", `${form.shift_start} – ${form.shift_end}`],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".45rem 0", borderBottom: "1px solid rgba(13,13,13,.06)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{k}</span><strong>{v}</strong>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: ".45rem 0" }}>
                          <span style={{ color: "var(--text-muted)" }}>Status</span>
                          <strong style={{ color: "#92400e" }}>⏳ Pending Admin Approval</strong>
                        </div>
                      </div>

                      <p style={{ fontSize: ".84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>Our team will review your request and assign the best-matched worker within 24 hours. You&apos;ll receive an email confirmation once approved.</p>
                      <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
                        <button onClick={downloadReceipt} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>💾 Download Receipt</button>
                        <button onClick={() => window.print()} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>🖨 Print Receipt</button>
                        <button onClick={newBooking} type="button" className="btn-book-secondary" style={{ width: "auto", padding: ".65rem 1.5rem" }}>New Booking</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL 3 — What's Included */}
            <div className={`wf-panel${step === 3 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-card">
                <div className="booking-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  <h2>My Assigned Jobs</h2>
                  <span className="header-badge">Employee View</span>
                </div>
                <div className="booking-card-body">
                  {!token ? (
                    <div className="worker-empty-state">
                      <h3>Log in with a worker account</h3>
                      <p>Assigned jobs and completed history are only visible to Marajo workforce employees.</p>
                      <button type="button" className="btn-book-primary" onClick={() => requireLogin()}>Log In</button>
                    </div>
                  ) : assignmentError ? (
                    <div className="booking-message platform-message is-visible" style={{ background: "rgba(220,38,38,.08)", color: "#dc2626" }}>
                      {assignmentError}
                    </div>
                  ) : assignmentLoading ? (
                    <div className="worker-empty-state">
                      <h3>Loading assignments...</h3>
                      <p>Checking jobs assigned to your workforce profile.</p>
                    </div>
                  ) : (
                    <>
                      <div className="worker-assignment-summary">
                        <div>
                          <span>Employee</span>
                          <strong>
                            {assignmentWorker
                              ? [assignmentWorker.first_name, assignmentWorker.last_name].filter(Boolean).join(" ")
                              : "Worker account"}
                          </strong>
                        </div>
                        <div><span>Active Jobs</span><strong>{activeAssignments.length}</strong></div>
                        <div><span>Completed</span><strong>{completedAssignments.length}</strong></div>
                      </div>

                      <div className="worker-assignment-section">
                        <div className="worker-section-heading">
                          <h3>Active Assignments</h3>
                          <button type="button" className="btn-book-secondary" onClick={loadAssignments}>Refresh</button>
                        </div>
                        {activeAssignments.length ? (
                          <div className="worker-assignment-list">
                            {activeAssignments.map((assignment) => assignmentCard(assignment, "active"))}
                          </div>
                        ) : (
                          <div className="worker-empty-state">
                            <h3>No active assigned jobs</h3>
                            <p>When admin assigns an accepted workforce request to you, it will appear here.</p>
                          </div>
                        )}
                      </div>

                      <div className="worker-assignment-section">
                        <div className="worker-section-heading">
                          <h3>Completed History</h3>
                        </div>
                        {completedAssignments.length ? (
                          <div className="worker-assignment-list">
                            {completedAssignments.map((assignment) => assignmentCard(assignment, "completed"))}
                          </div>
                        ) : (
                          <div className="worker-empty-state compact">
                            <p>No completed jobs yet.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL 4 - What's Included */}
            <div className={`wf-panel${step === 4 ? " is-active" : ""}`} role="tabpanel">
              <div className="booking-card">
                <div className="booking-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <h2>What&apos;s Included in a Booking</h2>
                </div>
                <div className="booking-card-body">
                  <div className="panel-table-wrap">
                    <table className="platform-table">
                      <thead><tr><th>Detail</th><th>Covered</th></tr></thead>
                      <tbody>
                        <tr><td>Worker identity verification</td><td><span className="status-pill">Yes</span></td></tr>
                        <tr><td>Skills and experience on file</td><td><span className="status-pill">Yes</span></td></tr>
                        <tr><td>Shift time and date confirmation</td><td><span className="status-pill">Yes</span></td></tr>
                        <tr><td>Hourly / daily rate breakdown</td><td><span className="status-pill">Yes</span></td></tr>
                        <tr><td>Rating after shift completion</td><td><span className="status-pill warn">Coming Soon</span></td></tr>
                      </tbody>
                    </table>
                  </div>
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
