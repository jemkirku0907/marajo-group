"use client";

import { useEffect, useState } from "react";
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-gray-200">
          <button
            className={`px-3 py-2 text-sm font-medium ${tab === "profile" ? "border-b-2 border-[#1a1a2e] text-[#1a1a2e]" : "text-gray-500"}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${tab === "history" ? "border-b-2 border-[#1a1a2e] text-[#1a1a2e]" : "text-gray-500"}`}
            onClick={() => setTab("history")}
          >
            Booking History
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading…</p>}

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
            {history.length === 0 && <p className="text-sm text-gray-500">No bookings yet.</p>}
            {history.map((h) => (
              <div key={`${h.type}-${h.id}`} className="rounded-lg border border-gray-200 p-3 print:break-inside-avoid">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {h.type_label}
                  </span>
                  <span className="text-xs text-gray-400">{h.reference}</span>
                </div>
                <p className="mt-1 text-sm text-gray-800">{h.details}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{h.date}</span>
                  <span className="capitalize">{h.status}</span>
                </div>
                {h.total != null && <p className="mt-1 text-sm font-semibold text-gray-900">₱{Number(h.total).toLocaleString()}</p>}
                <button
                  onClick={() => window.print()}
                  className="mt-2 text-xs font-medium text-[#1a1a2e] underline print:hidden"
                >
                  Print receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
