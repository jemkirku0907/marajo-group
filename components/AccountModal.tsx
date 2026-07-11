"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAuth, authHeaders } from "@/lib/AuthContext";

type HistoryItem = {
  type: string;
  type_label: string;
  id: number;
  reference: string;
  date: string;
  status: string;
  payment_status: string | null;
  details: string;
  total: number | null;
  created_at: string;
  meta?: Record<string, any>;
};

type WorkerAssignment = {
  id: number;
  client_name: string;
  contact_number: string;
  email: string;
  position: string;
  slots_needed: number;
  job_date: string;
  shift_start: string;
  shift_end: string;
  notes: string | null;
  admin_notes: string | null;
  worker_notes?: string | null;
  status: "accepted" | "in_progress" | "done" | "declined";
  status_label: string;
  current_status_age: string;
  total_elapsed: string;
};

const APPROVED_STATUSES = new Set(["accepted", "approved", "confirmed", "in_progress", "done", "completed", "paid"]);

export default function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { token, user } = useAuth();
  const isWorker = user?.role === "worker";
  const [tab, setTab] = useState<"profile" | "history" | "assignments">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [assignments, setAssignments] = useState<{ active: WorkerAssignment[]; completed: WorkerAssignment[] }>({
    active: [],
    completed: [],
  });
  const [assignmentNotes, setAssignmentNotes] = useState<Record<number, string>>({});
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    const h = await fetch("/api/user?action=history", {
      headers: authHeaders(token),
      cache: "no-store",
    }).then((r) => r.json());
    if (h.success) setHistory(h.history);
  }, [token]);

  const loadAssignments = useCallback(async () => {
    if (!token || !isWorker) return;
    const data = await fetch("/api/worker/tasks", {
      headers: authHeaders(token),
      cache: "no-store",
    }).then((r) => r.json());
    if (data.success) {
      setAssignments({ active: data.active || [], completed: data.completed || [] });
      setAssignmentNotes((current) => {
        const next = { ...current };
        [...(data.active || []), ...(data.completed || [])].forEach((item: WorkerAssignment) => {
          if (next[item.id] === undefined) next[item.id] = item.worker_notes || "";
        });
        return next;
      });
    } else {
      setAssignmentMessage(data.message || "Unable to load assigned tasks.");
    }
  }, [isWorker, token]);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    Promise.all([
      fetch("/api/user?action=profile", { headers: authHeaders(token), cache: "no-store" }).then((r) => r.json()),
      loadHistory(),
      isWorker ? loadAssignments() : Promise.resolve(),
    ])
      .then(([p]) => {
        if (p.success) setProfile(p.user);
      })
      .finally(() => setLoading(false));
  }, [isWorker, loadAssignments, loadHistory, open, token]);

  useEffect(() => {
    if (!open || tab !== "history") return;
    loadHistory().catch((error) => console.error("Failed to refresh booking history:", error));
  }, [loadHistory, open, tab]);

  useEffect(() => {
    if (!open || tab !== "assignments") return;
    loadAssignments().catch((error) => console.error("Failed to refresh assignments:", error));
  }, [loadAssignments, open, tab]);

  useEffect(() => {
    if (!token) return;
    const refresh = () => {
      loadHistory().catch((error) => console.error("Failed to refresh booking history:", error));
    };
    window.addEventListener("marajo:booking-history-refresh", refresh);
    return () => window.removeEventListener("marajo:booking-history-refresh", refresh);
  }, [loadHistory, token]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!isWorker && tab === "assignments") setTab("profile");
  }, [isWorker, tab]);

  const approvedHistory = useMemo(
    () => history.filter((item) => APPROVED_STATUSES.has(String(item.status).toLowerCase())),
    [history]
  );

  async function updateAssignment(id: number, status: "in_progress" | "done" | "declined") {
    if (!token) return;
    setUpdatingAssignmentId(id);
    setAssignmentMessage("");
    try {
      const res = await fetch("/api/worker/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ id, status, worker_note: assignmentNotes[id] || "" }),
      });
      const data = await res.json();
      if (!data.success) {
        setAssignmentMessage(data.message || "Could not update assignment.");
        return;
      }
      setAssignmentMessage(status === "declined" ? "Assignment declined and returned to admin." : "Assignment status updated.");
      await loadAssignments();
    } catch {
      setAssignmentMessage("Network error. Please try again.");
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-24 sm:pt-28">
      <div className="relative mb-8 max-h-[calc(100vh-8rem)] w-full max-w-2xl overflow-y-auto rounded-xl border p-6 shadow-2xl theme-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-heading">My Account</h2>
          <button onClick={onClose} className="theme-muted" aria-label="Close">
            x
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 theme-border-b">
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>Profile</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>Booking History</TabButton>
          {isWorker && <TabButton active={tab === "assignments"} onClick={() => setTab("assignments")}>Assigned Tasks</TabButton>}
        </div>

        {loading && <p className="text-sm theme-muted">Loading...</p>}

        {!loading && tab === "profile" && (
          <div className="space-y-2 text-sm">
            <Row label="Name" value={profile?.name || user?.name} />
            <Row label="Email" value={profile?.email || user?.email} />
            <Row label="Phone" value={profile?.phone || "-"} />
            <Row label="Address" value={profile?.address || "-"} />
            <Row
              label="Member since"
              value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
            />
          </div>
        )}

        {!loading && tab === "history" && (
          <div className="space-y-3">
            {approvedHistory.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100">
                {approvedHistory.length} approved request{approvedHistory.length === 1 ? "" : "s"} found. Approved bookings now show here as soon as admin updates their status.
              </div>
            )}
            {history.length === 0 && <p className="text-sm theme-muted">No bookings yet.</p>}
            {history.map((h) => (
              <HistoryCard key={`${h.type}-${h.id}`} item={h} onReceipt={() => printReceipt(h, profile || user)} />
            ))}
          </div>
        )}

        {!loading && tab === "assignments" && (
          <div className="space-y-4">
            {assignmentMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100">
                {assignmentMessage}
              </div>
            )}
            {assignments.active.length === 0 && assignments.completed.length === 0 && (
              <p className="text-sm theme-muted">No assigned workforce tasks yet.</p>
            )}
            {assignments.active.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                note={assignmentNotes[assignment.id] || ""}
                onNote={(value) => setAssignmentNotes((notes) => ({ ...notes, [assignment.id]: value }))}
                updating={updatingAssignmentId === assignment.id}
                onUpdate={updateAssignment}
              />
            ))}
            {assignments.completed.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-bold theme-heading">Completed</h3>
                <div className="space-y-3">
                  {assignments.completed.map((assignment) => (
                    <AssignmentSummary key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      className={`px-3 py-2 text-sm font-medium account-tab-button ${active ? "is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function HistoryCard({ item, onReceipt }: { item: HistoryItem; onReceipt: () => void }) {
  const status = String(item.status || "pending").toLowerCase();
  const approved = APPROVED_STATUSES.has(status);
  return (
    <div className="rounded-lg border p-3 print:break-inside-avoid theme-subpanel">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold theme-pill">{item.type_label}</span>
        <span className="text-xs theme-muted">{item.reference}</span>
      </div>
      <p className="mt-1 text-sm theme-text">{item.details}</p>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs theme-muted">
        <span>{formatDate(item.date)}</span>
        <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${approved ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"}`}>
          {approved ? "Approved" : item.status}
        </span>
      </div>
      {approved && <p className="mt-2 text-xs font-medium text-green-700 dark:text-green-300">Admin approved this request.</p>}
      {item.total != null && <p className="mt-1 text-sm font-semibold theme-heading">PHP {Number(item.total).toLocaleString()}</p>}
      <button onClick={onReceipt} className="mt-2 text-xs font-medium theme-link underline print:hidden" type="button">
        Download / print receipt
      </button>
    </div>
  );
}

function AssignmentCard({
  assignment,
  note,
  onNote,
  updating,
  onUpdate,
}: {
  assignment: WorkerAssignment;
  note: string;
  onNote: (value: string) => void;
  updating: boolean;
  onUpdate: (id: number, status: "in_progress" | "done" | "declined") => void;
}) {
  const canStart = assignment.status === "accepted";
  const canFinish = assignment.status === "in_progress";
  return (
    <article className="rounded-lg border p-4 theme-subpanel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold theme-pill">{assignment.status_label}</span>
          <h3 className="mt-2 text-base font-bold theme-heading">{roleLabel(assignment.position)}</h3>
          <p className="text-sm theme-muted">{assignment.client_name || "Unnamed client"} - {assignment.slots_needed || 1} worker(s)</p>
        </div>
        <span className="text-xs theme-muted">WF-{assignment.id}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <Row label="Date" value={formatDate(assignment.job_date)} />
        <Row label="Shift" value={[assignment.shift_start, assignment.shift_end].filter(Boolean).join(" - ") || "No time"} />
        <Row label="Contact" value={assignment.contact_number || assignment.email || "No contact"} />
        <Row label="Time in status" value={assignment.current_status_age} />
      </div>
      {(assignment.admin_notes || assignment.notes) && (
        <div className="mt-3 rounded-lg border p-3 text-xs theme-panel">
          {assignment.admin_notes && <p><strong>Admin note:</strong> {assignment.admin_notes}</p>}
          {assignment.notes && <p><strong>Client note:</strong> {assignment.notes}</p>}
        </div>
      )}
      <label className="mt-3 block text-xs font-semibold theme-muted" htmlFor={`worker-note-${assignment.id}`}>
        Note for admin
      </label>
      <textarea
        id={`worker-note-${assignment.id}`}
        value={note}
        onChange={(e) => onNote(e.target.value)}
        className="mt-1 min-h-20 w-full rounded-lg border bg-transparent p-3 text-sm theme-text"
        placeholder="Optional update or reason..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" disabled={!canStart || updating} onClick={() => onUpdate(assignment.id, "declined")}>
          Decline
        </button>
        <button type="button" className="btn-primary" disabled={!canStart || updating} onClick={() => onUpdate(assignment.id, "in_progress")}>
          Accept / Start Job
        </button>
        <button type="button" className="btn-primary" disabled={!canFinish || updating} onClick={() => onUpdate(assignment.id, "done")}>
          Mark Done
        </button>
      </div>
    </article>
  );
}

function AssignmentSummary({ assignment }: { assignment: WorkerAssignment }) {
  return (
    <article className="rounded-lg border p-3 theme-subpanel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold theme-heading">{roleLabel(assignment.position)}</div>
          <div className="text-xs theme-muted">{formatDate(assignment.job_date)} - Total time: {assignment.total_elapsed}</div>
        </div>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-200">
          {assignment.status_label}
        </span>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 theme-border-b">
      <span className="theme-muted">{label}</span>
      <span className="text-right font-medium theme-heading">{value}</span>
    </div>
  );
}

function roleLabel(role: string) {
  return String(role || "Worker")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function escapeHtml(value: any) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printReceipt(item: HistoryItem, profile: any) {
  const win = window.open("", "_blank", "width=860,height=960");
  if (!win) return;
  const approved = APPROVED_STATUSES.has(String(item.status).toLowerCase());
  const total = item.total != null ? `PHP ${Number(item.total).toLocaleString()}` : "No charge recorded";
  const issued = new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
  const bookingDate = formatDate(item.date || item.created_at);
  const html = `<!doctype html>
<html>
<head>
  <title>${escapeHtml(item.reference)} Receipt</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f7f1; color: #0b1b12; font-family: Arial, sans-serif; }
    .receipt { width: min(760px, calc(100vw - 32px)); margin: 24px auto; background: #fff; border: 1px solid #d8e7d4; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.12); }
    .head { background: #0c3b1d; color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; gap: 24px; }
    .brand { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; opacity: .86; }
    h1 { margin: 8px 0 0; font-size: 30px; }
    .status { align-self: flex-start; border-radius: 999px; padding: 8px 14px; background: ${approved ? "#1f7a3b" : "#b45309"}; font-weight: 800; }
    .body { padding: 30px 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 22px 0; }
    .box { border: 1px solid #e3eadf; border-radius: 14px; padding: 16px; background: #fbfdf9; }
    .label { color: #607065; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; font-weight: 800; }
    .value { margin-top: 6px; font-size: 16px; font-weight: 700; }
    .total { margin-top: 20px; border-radius: 16px; background: #edf8e7; padding: 20px; display:flex; justify-content:space-between; align-items:center; font-size: 20px; font-weight: 900; color: #0c3b1d; }
    .foot { border-top: 1px solid #e3eadf; padding: 18px 32px; color: #607065; font-size: 13px; }
    .actions { width: min(760px, calc(100vw - 32px)); margin: 0 auto 24px; display:flex; justify-content:flex-end; }
    button { border: 0; border-radius: 10px; background: #1f7a3b; color: #fff; padding: 12px 18px; font-weight: 800; cursor:pointer; }
    @media print { body { background:#fff; } .receipt { box-shadow:none; margin:0; width:100%; border-radius:0; } .actions { display:none; } }
  </style>
</head>
<body>
  <main class="receipt">
    <section class="head">
      <div>
        <div class="brand">Marajo Group Official Receipt</div>
        <h1>${escapeHtml(item.type_label)} Receipt</h1>
        <p>Reference: <strong>${escapeHtml(item.reference)}</strong></p>
      </div>
      <div class="status">${approved ? "Approved" : escapeHtml(item.status || "Pending")}</div>
    </section>
    <section class="body">
      <div class="grid">
        <div class="box"><div class="label">Client</div><div class="value">${escapeHtml(profile?.name || profile?.email || "Marajo Client")}</div></div>
        <div class="box"><div class="label">Email</div><div class="value">${escapeHtml(profile?.email || "-")}</div></div>
        <div class="box"><div class="label">Booking</div><div class="value">${escapeHtml(item.details)}</div></div>
        <div class="box"><div class="label">Date</div><div class="value">${escapeHtml(bookingDate)}</div></div>
        <div class="box"><div class="label">Request status</div><div class="value">${escapeHtml(item.status || "Pending")}</div></div>
        <div class="box"><div class="label">Payment status</div><div class="value">${escapeHtml(item.payment_status || "Pending")}</div></div>
      </div>
      <div class="total"><span>Total</span><span>${escapeHtml(total)}</span></div>
    </section>
    <section class="foot">
      Issued ${escapeHtml(issued)}. Present this receipt and booking reference at Marajo Group when requested.
    </section>
  </main>
  <div class="actions"><button onclick="window.print()">Download / Save as PDF</button></div>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
