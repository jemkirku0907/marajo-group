"use client";

import { useEffect, useState } from "react";
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
};

export default function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<"profile" | "history">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    Promise.all([
      fetch("/api/user?action=profile", { headers: authHeaders(token) }).then((r) => r.json()),
      fetch("/api/user?action=history", { headers: authHeaders(token) }).then((r) => r.json()),
    ])
      .then(([p, h]) => {
        if (p.success) setProfile(p.user);
        if (h.success) setHistory(h.history);
      })
      .finally(() => setLoading(false));
  }, [open, token]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-24 sm:pt-28">
      <div className="relative mb-8 max-h-[calc(100vh-8rem)] w-full max-w-lg overflow-y-auto rounded-xl border p-6 shadow-2xl theme-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-heading">My Account</h2>
          <button onClick={onClose} className="theme-muted" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-2 theme-border-b">
          <button
            className={`px-3 py-2 text-sm font-medium account-tab-button ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium account-tab-button ${tab === "history" ? "is-active" : ""}`}
            onClick={() => setTab("history")}
          >
            Booking History
          </button>
        </div>

        {loading && <p className="text-sm theme-muted">Loading...</p>}

        {!loading && tab === "profile" && (
          <div className="space-y-2 text-sm">
            <Row label="Name" value={profile?.name || user?.name} />
            <Row label="Email" value={profile?.email || user?.email} />
            <Row label="Phone" value={profile?.phone || "—"} />
            <Row label="Address" value={profile?.address || "—"} />
            <Row
              label="Member since"
              value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
            />
          </div>
        )}

        {!loading && tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 && <p className="text-sm theme-muted">No bookings yet.</p>}
            {history.map((h) => (
              <div key={`${h.type}-${h.id}`} className="rounded-lg border p-3 print:break-inside-avoid theme-subpanel">
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold theme-pill">
                    {h.type_label}
                  </span>
                  <span className="text-xs theme-muted">{h.reference}</span>
                </div>
                <p className="mt-1 text-sm theme-text">{h.details}</p>
                <div className="mt-1 flex items-center justify-between text-xs theme-muted">
                  <span>{h.date}</span>
                  <span className="capitalize">{h.status}</span>
                </div>
                {h.total != null && <p className="mt-1 text-sm font-semibold theme-heading">₱{Number(h.total).toLocaleString()}</p>}
                <button
                  onClick={() => window.print()}
                  className="mt-2 text-xs font-medium theme-link underline print:hidden"
                >
                  Print receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-1.5 theme-border-b">
      <span className="theme-muted">{label}</span>
      <span className="font-medium theme-heading">{value}</span>
    </div>
  );
}
