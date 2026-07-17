"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeController from "@/components/ThemeController";

type Staff = {
  id: number;
  name: string;
  role: string;
  role_code: string;
};

type Inquiry = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  project?: string;
  unit_name?: string;
  message?: string;
  status: string;
  staff_name?: string;
  created_at?: string;
};

const STATUS_OPTIONS = [
  "New Lead",
  "Contacted",
  "Interested",
  "Qualified",
  "Site Visit Scheduled",
  "Negotiating",
  "Reserved",
  "Closed Sale",
  "Lost Lead",
];

const statusColor: Record<string, string> = {
  "New Lead": "#3b82f6",
  Contacted: "#6366f1",
  Interested: "#8b5cf6",
  Qualified: "#0ea5e9",
  "Site Visit Scheduled": "#f59e0b",
  Negotiating: "#f97316",
  Reserved: "#16a34a",
  "Closed Sale": "#15803d",
  "Lost Lead": "#ef4444",
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-muted)",
  borderRadius: 12,
  padding: 18,
  boxShadow: "var(--shadow)",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-muted)",
  borderRadius: 9,
  padding: "10px 12px",
  background: "var(--surface)",
  color: "var(--text-primary)",
  font: "inherit",
};

const actionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--mg-green)",
  borderRadius: 8,
  padding: "8px 12px",
  background: "var(--mg-green)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "none",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth?action=me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          router.replace("/admin/login");
          return;
        }
        setStaff(data.staff);
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function logout() {
    await fetch("/api/admin/auth?action=logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (checking) return <AdminLoading />;
  if (!staff) return null;

  return (
    <div className={`admin-dashboard-shell${sidebarOpen ? " is-sidebar-open" : ""}`}>
      <button className="admin-dashboard-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />

      <aside className="admin-dashboard-sidebar">
        <div className="admin-dashboard-brand">
          <img src="/assets/logo.png" alt="Marajo Group" className="admin-dashboard-logo" />
          <div className="admin-dashboard-brand-copy">
            <strong>Marajo Group</strong>
            <span>Inquiry Portal</span>
          </div>
        </div>

        <div>
          <div className="admin-sidebar-section-label">Main</div>
          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            <button className="admin-inquiry-nav is-active" type="button" onClick={() => setSidebarOpen(false)}>
              <span className="admin-sidebar-icon"><MailIcon /></span>
              <span>Inquiries</span>
            </button>
          </div>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-sidebar-avatar">{staff.name?.charAt(0) || "A"}</div>
          <div className="admin-dashboard-brand-copy">
            <strong>{staff.name}</strong>
            <span>{staff.role}</span>
          </div>
        </div>

        <button className="admin-sidebar-logout" onClick={logout} type="button">
          <span className="admin-sidebar-icon"><LogOutIcon /></span>
          <span>Log out</span>
        </button>
      </aside>

      <div className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-header-inner">
            <div>
              <button className="admin-mobile-menu-button" onClick={() => setSidebarOpen(true)} type="button">
                Menu
              </button>
              <h1 style={{ margin: 0, color: "var(--heading-color)", fontSize: 26 }}>Inquiries</h1>
              <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
                View, respond to, and track inquiries submitted through the Marajo Group website.
              </p>
            </div>
            <div className="admin-dashboard-actions">
              <ThemeController />
            </div>
          </div>
        </header>

        <main className="admin-dashboard-main">
          <InquiryManager />
        </main>
      </div>
    </div>
  );
}

function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads?action=list", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load inquiries.");
      setInquiries(data.leads || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      const matchesStatus = !statusFilter || inquiry.status === statusFilter;
      const matchesQuery =
        !query ||
        [inquiry.name, inquiry.email, inquiry.phone, inquiry.project, inquiry.unit_name, inquiry.message].some((value) =>
          String(value ?? "").toLowerCase().includes(query),
        );
      return matchesStatus && matchesQuery;
    });
  }, [inquiries, search, statusFilter]);

  const counts = useMemo(() => {
    return STATUS_OPTIONS.reduce<Record<string, number>>((result, status) => {
      result[status] = inquiries.filter((inquiry) => inquiry.status === status).length;
      return result;
    }, {});
  }, [inquiries]);

  if (loading) return <AdminLoading compact />;

  return (
    <>
      <section className="admin-inquiry-stats" aria-label="Inquiry totals">
        <Stat label="Total Inquiries" value={inquiries.length} />
        <Stat label="New Inquiries" value={counts["New Lead"] || 0} />
        <Stat label="Contacted" value={counts.Contacted || 0} />
        <Stat label="Qualified" value={counts.Qualified || 0} />
        <Stat label="Resolved / Closed" value={counts["Closed Sale"] || 0} />
      </section>

      <section style={{ ...cardStyle, overflowX: "auto" }}>
        <div className="admin-inquiry-toolbar">
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Website Inquiries</h2>
            <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              Contact-form submissions appear here automatically.
            </p>
          </div>
          <input
            type="search"
            aria-label="Search inquiries"
            placeholder="Search name, email, message…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...inputStyle, minWidth: 230 }}
          />
          <select aria-label="Filter inquiry status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" onClick={load} style={actionStyle}>Refresh</button>
        </div>

        {error && <p className="admin-inquiry-error">{error}</p>}

        <table className="admin-inquiry-table">
          <thead>
            <tr>
              <th>Inquirer</th>
              <th>Property / Subject</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Received</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>
                  <strong>{inquiry.name}</strong>
                  <span>{inquiry.email || inquiry.phone || "No contact supplied"}</span>
                </td>
                <td>{[inquiry.project, inquiry.unit_name].filter(Boolean).join(" · ") || "General inquiry"}</td>
                <td><StatusBadge status={inquiry.status} /></td>
                <td>{inquiry.staff_name || "Unassigned"}</td>
                <td>{inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : "—"}</td>
                <td><button type="button" onClick={() => setOpenId(inquiry.id)} style={actionStyle}>View</button></td>
              </tr>
            ))}
            {!error && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 28 }}>No inquiries found.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {openId !== null && <InquiryDrawer id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </>
  );
}

function InquiryDrawer({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads?action=timeline&inquiry_id=${id}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to load inquiry.");
      setData(payload);
      setStatus(payload.lead.status);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inquiry.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStatus() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads?action=update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to update inquiry.");
      setNote("");
      await load();
      await onChanged();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update inquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-inquiry-drawer-backdrop" onClick={onClose}>
      <aside className="admin-inquiry-drawer" aria-label="Inquiry details" onClick={(event) => event.stopPropagation()}>
        <div className="admin-inquiry-drawer-header">
          <h2>Inquiry Details</h2>
          <button type="button" onClick={onClose} aria-label="Close inquiry details">×</button>
        </div>

        {loading && <AdminLoading compact />}
        {error && <p className="admin-inquiry-error">{error}</p>}

        {!loading && data && (
          <>
            <section className="admin-inquiry-person">
              <h3>{data.lead.name}</h3>
              <p>{data.lead.email || "No email"}{data.lead.phone ? ` · ${data.lead.phone}` : ""}</p>
              <p>{[data.lead.project, data.lead.unit_name].filter(Boolean).join(" · ") || "General inquiry"}</p>
              <StatusBadge status={data.lead.status} />
            </section>

            <section style={{ ...cardStyle, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
              <strong style={{ display: "block", marginBottom: 8 }}>Submitted message</strong>
              {data.lead.message || "No message was included."}
            </section>

            <div className="admin-inquiry-response-actions">
              {data.lead.email && (
                <a href={`mailto:${data.lead.email}?subject=${encodeURIComponent("Re: Your Marajo Group inquiry")}`} style={actionStyle}>Reply by Email</a>
              )}
              {data.lead.phone && <a href={`tel:${data.lead.phone}`} style={actionStyle}>Call Inquirer</a>}
            </div>

            <section style={cardStyle}>
              <strong style={{ display: "block", marginBottom: 10 }}>Update status</strong>
              <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: 10 }}>
                {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <textarea
                placeholder="Add a follow-up note (optional)"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                style={{ ...inputStyle, width: "100%", resize: "vertical", marginBottom: 10 }}
              />
              <button type="button" onClick={saveStatus} disabled={saving} style={{ ...actionStyle, width: "100%" }}>
                {saving ? "Saving…" : "Save Status"}
              </button>
            </section>

            <section>
              <strong style={{ display: "block", marginBottom: 10 }}>Activity timeline</strong>
              {data.timeline.length === 0 && <p style={{ color: "var(--text-muted)" }}>No activity yet.</p>}
              {data.timeline.map((activity: any) => (
                <article className="admin-inquiry-activity" key={activity.id}>
                  <time>{activity.created_at}</time>
                  <strong>{activity.staff_name}</strong>
                  <p>{activity.details}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <article style={cardStyle}><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</span><strong style={{ display: "block", marginTop: 6, fontSize: 26 }}>{value}</strong></article>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className="admin-inquiry-status" style={{ background: statusColor[status] || "#64748b" }}>{status}</span>;
}

function AdminLoading({ compact = false }: { compact?: boolean }) {
  return <div className="admin-inquiry-loading" style={{ minHeight: compact ? 180 : "100vh" }}><span /><p>Loading inquiries…</p></div>;
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}

function LogOutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /><path d="m14 8 4 4-4 4M18 12H9" /></svg>;
}
