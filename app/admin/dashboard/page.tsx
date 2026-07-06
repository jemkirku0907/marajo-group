"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeController from "@/components/ThemeController";

type Staff = { id: number; name: string; role: string; role_code: string };
type Tab =
  | "overview"
  | "units"
  | "leads"
  | "parking"
  | "facilities"
  | "workers"
  | "calendar"
  | "appointments"
  | "contacts"
  | "tasks"
  | "notifications"
  | "profile";

type AdminIcon =
  | "layout"
  | "building"
  | "users"
  | "car"
  | "court"
  | "tool"
  | "calendar"
  | "clock"
  | "mail"
  | "check"
  | "bell"
  | "user"
  | "logOut";

const ADMIN_NAV_ITEMS: Array<{ id: Tab; label: string; icon: AdminIcon }> = [
  { id: "overview", label: "Overview", icon: "layout" },
  { id: "units", label: "Units", icon: "building" },
  { id: "leads", label: "Leads", icon: "users" },
  { id: "parking", label: "Parking", icon: "car" },
  { id: "facilities", label: "Court Bookings", icon: "court" },
  { id: "workers", label: "Workers", icon: "tool" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "appointments", label: "Appointments", icon: "clock" },
  { id: "contacts", label: "Contacts", icon: "mail" },
  { id: "tasks", label: "Tasks", icon: "check" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "profile", label: "Profile", icon: "user" },
];

const sidebarStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const sidebarItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  border: "none",
  background: "transparent",
  textAlign: "left",
  fontSize: 14,
  color: "var(--text-muted)",
  padding: "12px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const sidebarItemActiveStyle: React.CSSProperties = {
  ...sidebarItemStyle,
  background: "var(--accent-soft)",
  color: "var(--mg-green)",
  fontWeight: 700,
  border: "1px solid var(--mg-green)",
};

function AdminNavIcon({ icon }: { icon: AdminIcon }) {
  const paths: Record<AdminIcon, React.ReactNode> = {
    layout: (
      <>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="3" y="15" width="18" height="5" rx="1.5" />
      </>
    ),
    building: (
      <>
        <path d="M4 21h16" />
        <path d="M6 21V5.8A1.8 1.8 0 0 1 7.8 4h8.4A1.8 1.8 0 0 1 18 5.8V21" />
        <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
      </>
    ),
    users: (
      <>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <circle cx="12" cy="8" r="3" />
        <path d="M20 18c0-1.8-1.2-3.2-3-3.7M4 18c0-1.8 1.2-3.2 3-3.7" />
      </>
    ),
    car: (
      <>
        <path d="M5 12l1.6-4.1A3 3 0 0 1 9.4 6h5.2a3 3 0 0 1 2.8 1.9L19 12" />
        <path d="M4 12h16v6H4z" />
        <circle cx="7.5" cy="18" r="1.4" />
        <circle cx="16.5" cy="18" r="1.4" />
      </>
    ),
    court: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M12 5v14M4 12h16M8 5v14M16 5v14" />
      </>
    ),
    tool: (
      <>
        <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.6 2.6-3-3z" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    mail: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M5 8l7 5 7-5" />
      </>
    ),
    check: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 10a6 6 0 0 0-12 0c0 7-2 7-2 7h16s-2 0-2-7" />
        <path d="M10 20a2.2 2.2 0 0 0 4 0" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </>
    ),
    logOut: (
      <>
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[icon]}
    </svg>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("marajo-admin-sidebar-collapsed");
    setSidebarCollapsed(stored === "true");
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth?action=me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          router.replace("/admin/login");
          return;
        }
        setStaff(data.staff);
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/auth?action=logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("marajo-admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setMobileSidebarOpen(false);
  }

  if (checking) {
    return <DashboardBootSkeleton />;
  }
  if (!staff) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {false && <div className="admin-theme-control" aria-label="Theme controls" style={{ display: "none" }}>
        <ThemeController />
      </div>}
      {false && <header
        style={{
          display: "none",
          background: "linear-gradient(135deg, var(--mg-green-deep), var(--mg-green))",
          color: "#fff",
          padding: "20px 30px",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,.12)",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Marajo Group — Staff Portal</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.78)", marginTop: 4 }}>
            Signed in
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,.3)",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>}

      <div className={`admin-dashboard-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "is-sidebar-open" : ""}`}>
        <button className="admin-dashboard-backdrop" aria-label="Close sidebar" onClick={() => setMobileSidebarOpen(false)} />
        <aside className="admin-dashboard-sidebar" style={sidebarStyle}>
          <div className="admin-dashboard-brand">
            <img src="/assets/logo.png" alt="Marajo Group" className="admin-dashboard-logo" />
            <div className="admin-dashboard-brand-copy">
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--heading-color)" }}>Marajo Group</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Staff Portal</div>
            </div>
            <button
              className="admin-sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              type="button"
            >
              <span className="admin-sidebar-toggle-icon" aria-hidden="true">
                {sidebarCollapsed ? ">" : "<"}
              </span>
            </button>
          </div>

          <div>
            <div className="admin-sidebar-section-label" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Main
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {ADMIN_NAV_ITEMS.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={item.label}
                  style={item.id === tab ? sidebarItemActiveStyle : sidebarItemStyle}
                >
                  <span className="admin-sidebar-icon"><AdminNavIcon icon={item.icon} /></span>
                  <span className="admin-sidebar-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="admin-sidebar-section-label" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Tools
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {ADMIN_NAV_ITEMS.slice(8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={item.label}
                  style={item.id === tab ? sidebarItemActiveStyle : sidebarItemStyle}
                >
                  <span className="admin-sidebar-icon"><AdminNavIcon icon={item.icon} /></span>
                  <span className="admin-sidebar-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{staff.name?.charAt(0) || "A"}</div>
            <div className="admin-dashboard-brand-copy">
              <strong>{staff.name}</strong>
              <span>{staff.role}</span>
            </div>
          </div>
          <button className="admin-sidebar-logout" onClick={handleLogout} title="Log out" type="button">
            <span className="admin-sidebar-icon"><AdminNavIcon icon="logOut" /></span>
            <span className="admin-sidebar-label">Log out</span>
          </button>
        </aside>

        <div className="admin-dashboard-content">
          <div className="admin-dashboard-header">
            <div className="admin-dashboard-header-inner">
              <div>
                <button className="admin-mobile-menu-button" onClick={() => setMobileSidebarOpen(true)} aria-label="Open sidebar">Menu</button>
                <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700, color: "var(--heading-color)" }}>{ADMIN_NAV_ITEMS.find((item) => item.id === tab)?.label}</h1>
                <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
                  {tab === "overview" && "Sales pipeline summary and portal activity."}
                  {tab === "units" && "Manage assigned units across all buildings."}
                  {tab === "leads" && "Track leads, inquiries, and status updates."}
                  {tab === "parking" && "Manage parking reservations and occupancy."}
                  {tab === "facilities" && "Handle court bookings and facility schedules."}
                  {tab === "workers" && "Manage workforce approvals and assignments."}
                  {tab === "calendar" && "View appointments and reservation dates."}
                  {tab === "appointments" && "Schedule and update client visits."}
                  {tab === "contacts" && "Keep contact records and inquiries organized."}
                  {tab === "tasks" && "Track pending tasks and follow-ups."}
                  {tab === "notifications" && "Review system alerts and messages."}
                  {tab === "profile" && "Update your staff profile and credentials."}
                </p>
              </div>
              <div className="admin-dashboard-actions">
                <ThemeController />
              </div>
            </div>
          </div>

          <main key={tab} className="admin-dashboard-main">
            {tab === "overview" && <OverviewTab onNavigate={handleTabChange} />}
            {tab === "units" && <UnitsTab />}
            {tab === "leads" && <LeadsTab />}
            {tab === "parking" && <ParkingTab />}
            {tab === "facilities" && <FacilitiesTab />}
            {tab === "workers" && <WorkersTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "appointments" && <AppointmentsTab />}
            {tab === "contacts" && <ContactsTab />}
            {tab === "tasks" && <TasksTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "profile" && <ProfileTab staff={staff} />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── shared bits ───────────────────── */

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-muted)",
  borderRadius: 12,
  padding: 18,
  boxShadow: "var(--shadow)",
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)" };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "11px 12px",
  borderBottom: "1px solid var(--border-muted)",
  background: "var(--surface-soft)",
  color: "var(--text-muted)",
  fontWeight: 700,
};
const tdStyle: React.CSSProperties = {
  padding: "11px 12px",
  borderBottom: "1px solid var(--border-muted)",
  color: "var(--text-primary)",
  verticalAlign: "middle",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--border-muted)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text-primary)",
  background: "var(--surface)",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--heading-color)" }}>{value}</div>
    </div>
  );
}

function SkeletonLine({ width = "100%", height = 14 }: { width?: string; height?: number }) {
  return <span className="dashboard-skeleton-line" style={{ width, height }} />;
}

function DashboardBootSkeleton() {
  return (
    <div className="admin-dashboard-shell dashboard-loading-shell">
      <aside className="admin-dashboard-sidebar" style={sidebarStyle}>
        <div className="admin-dashboard-brand">
          <SkeletonLine width="48px" height={48} />
          <div className="admin-dashboard-brand-copy" style={{ flex: 1 }}>
            <SkeletonLine width="130px" height={16} />
            <SkeletonLine width="86px" height={12} />
          </div>
        </div>
        <div className="dashboard-skeleton-list">
          {Array.from({ length: 9 }).map((_, index) => (
            <SkeletonLine key={index} width="100%" height={42} />
          ))}
        </div>
      </aside>
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <SkeletonLine width="210px" height={32} />
          <SkeletonLine width="340px" height={16} />
        </div>
        <main className="admin-dashboard-main">
          <DashboardSkeleton variant="overview" />
        </main>
      </div>
    </div>
  );
}

function DashboardSkeleton({ variant = "table" }: { variant?: "overview" | "table" | "profile" | "list" | "calendar" }) {
  if (variant === "profile") {
    return (
      <div className="dashboard-skeleton-stack" style={{ maxWidth: 520 }}>
        <SkeletonLine width="190px" height={24} />
        <div style={cardStyle}>
          <SkeletonLine width="40%" height={18} />
          <SkeletonLine width="100%" height={42} />
          <SkeletonLine width="100%" height={42} />
          <SkeletonLine width="140px" height={38} />
        </div>
        <div style={cardStyle}>
          <SkeletonLine width="48%" height={18} />
          <SkeletonLine width="100%" height={42} />
          <SkeletonLine width="100%" height={42} />
        </div>
      </div>
    );
  }

  if (variant === "calendar" || variant === "list") {
    return (
      <div className="dashboard-skeleton-stack">
        <SkeletonLine width="220px" height={24} />
        {Array.from({ length: variant === "calendar" ? 4 : 5 }).map((_, index) => (
          <div key={index} style={cardStyle}>
            <SkeletonLine width="32%" height={18} />
            <SkeletonLine width="76%" height={14} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-skeleton-stack">
      <div className="dashboard-skeleton-stats">
        {Array.from({ length: variant === "overview" ? 5 : 4 }).map((_, index) => (
          <div key={index} style={cardStyle}>
            <SkeletonLine width="52%" height={14} />
            <SkeletonLine width="34%" height={28} />
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <div className="dashboard-skeleton-toolbar">
          <SkeletonLine width="220px" height={22} />
          <SkeletonLine width="260px" height={42} />
        </div>
        <div className="dashboard-skeleton-table">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonLine key={index} width="100%" height={index === 0 ? 48 : 54} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Leads tab ───────────────────── */

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

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/leads?action=list").then((res) => res.json());
    setLeads(r.leads || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = leads.filter((l) => {
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [l.name, l.project, l.unit_name, l.email, l.phone].some((v) => String(v ?? "").toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  if (loading) return <DashboardSkeleton variant="table" />;

  const statusCounts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={leads.length} />
        <StatCard label="New" value={statusCounts["New Lead"] ?? 0} />
        <StatCard label="Site Visits" value={statusCounts["Site Visit Scheduled"] ?? 0} />
        <StatCard label="Reserved" value={statusCounts["Reserved"] ?? 0} />
        <StatCard label="Closed Sale" value={statusCounts["Closed Sale"] ?? 0} />
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <h3 style={{ marginRight: "auto" }}>Leads & Inquiries</h3>
          <input
            placeholder="Search name, property, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, minWidth: 220 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Lead</th>
              <th style={thStyle}>Property / Unit</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Agent</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.email || l.phone}</div>
                </td>
                <td style={tdStyle}>
                  {l.project || "—"}
                  {l.unit_name ? ` · ${l.unit_name}` : ""}
                </td>
                <td style={tdStyle}>{l.lead_score ?? 0}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      background: statusColor[l.status] || "var(--text-muted)",
                    }}
                  >
                    {l.status}
                  </span>
                </td>
                <td style={tdStyle}>{l.staff_name || "Unassigned"}</td>
                <td style={tdStyle}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                <td style={tdStyle}>
                  <button onClick={() => setOpenId(l.id)} style={actionBtn}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openId !== null && <LeadDrawer id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}

function LeadDrawer({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/leads?action=timeline&inquiry_id=${id}`).then((res) => res.json());
    if (r.success) {
      setData(r);
      setStatus(r.lead.status);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStatus() {
    setSaving(true);
    await fetch("/api/admin/leads?action=update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, note }),
    });
    setNote("");
    setSaving(false);
    await load();
    onChanged();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{ width: 420, maxWidth: "100%", background: "var(--surface)", color: "var(--text-primary)", height: "100%", overflowY: "auto", padding: 24, borderLeft: "1px solid var(--border-muted)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Lead Details</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>

        {loading && <DashboardSkeleton variant="profile" />}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{data.lead.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {data.lead.email} {data.lead.phone ? `· ${data.lead.phone}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {data.lead.project} {data.lead.unit_name ? `· ${data.lead.unit_name}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Lead score: {data.lead.lead_score ?? 0}</div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--heading-color)" }}>UPDATE STATUS</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...inputStyle, width: "100%", marginBottom: 8 }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Add a follow-up note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{ ...inputStyle, width: "100%", marginBottom: 8 }}
              />
              <button onClick={saveStatus} disabled={saving} style={{ ...actionBtn, width: "100%" }}>
                {saving ? "Saving…" : "Save Status"}
              </button>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--heading-color)" }}>ACTIVITY TIMELINE</div>
              {data.timeline.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No activity yet.</p>}
              {data.timeline.map((a: any) => (
                <div key={a.id} style={{ borderLeft: "2px solid var(--border-muted)", paddingLeft: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.created_at}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.staff_name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.details}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── Parking tab ───────────────────── */

function ParkingTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, r] = await Promise.all([
      fetch("/api/admin/parking?action=analytics").then((res) => res.json()),
      fetch("/api/admin/parking?action=reservations").then((res) => res.json()),
    ]);
    setAnalytics(a.analytics);
    setReservations(r.reservations || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: number, reservation_status: string) {
    await fetch("/api/admin/parking?action=update-reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reservation_status }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Reservations" value={analytics?.total_reservations ?? 0} />
        <StatCard label="Today" value={analytics?.today_reservations ?? 0} />
        <StatCard label="Upcoming" value={analytics?.upcoming_reservations ?? 0} />
        <StatCard label="Occupancy" value={`${analytics?.occupancy_rate ?? 0}%`} />
        <StatCard label="Revenue Today" value={`₱${analytics?.revenue_today ?? 0}`} />
        <StatCard label="Revenue (Month)" value={`₱${analytics?.revenue_month ?? 0}`} />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: 12 }}>Reservations</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Slot</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.full_name}</td>
                <td style={tdStyle}>{r.slot_number}</td>
                <td style={tdStyle}>{r.reservation_date}</td>
                <td style={tdStyle}>{r.reservation_status}</td>
                <td style={tdStyle}>{r.payment_status}</td>
                <td style={tdStyle}>
                  {r.reservation_status === "pending" && (
                    <button onClick={() => updateStatus(r.id, "confirmed")} style={actionBtn}>
                      Confirm
                    </button>
                  )}
                  {r.reservation_status !== "cancelled" && (
                    <button onClick={() => updateStatus(r.id, "cancelled")} style={{ ...actionBtn, background: "#ef4444" }}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Facilities (court bookings) tab ───────────────────── */

function FacilitiesTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, b] = await Promise.all([
      fetch("/api/admin/facilities?action=analytics").then((res) => res.json()),
      fetch("/api/admin/facilities?action=bookings").then((res) => res.json()),
    ]);
    setAnalytics(a.analytics);
    setBookings(b.bookings || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: number, booking_status: string) {
    await fetch("/api/admin/facilities?action=update-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, booking_status }),
    });
    load();
  }

  async function cancelBooking(id: number) {
    await fetch("/api/admin/facilities?action=cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Bookings" value={analytics?.total ?? 0} />
        <StatCard label="Today" value={analytics?.today ?? 0} />
        <StatCard label="Upcoming" value={analytics?.upcoming ?? 0} />
        <StatCard label="Revenue Today" value={`₱${analytics?.revenue_today ?? 0}`} />
        <StatCard label="Revenue (Week)" value={`₱${analytics?.revenue_week ?? 0}`} />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: 12 }}>Court Bookings</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td style={tdStyle}>{b.full_name}</td>
                <td style={tdStyle}>{b.booking_date}</td>
                <td style={tdStyle}>{b.booking_status}</td>
                <td style={tdStyle}>{b.payment_status}</td>
                <td style={tdStyle}>
                  {b.booking_status === "pending" && (
                    <button onClick={() => updateStatus(b.id, "confirmed")} style={actionBtn}>
                      Confirm
                    </button>
                  )}
                  {b.booking_status !== "cancelled" && (
                    <button onClick={() => cancelBooking(b.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={5}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Workers tab ───────────────────── */

function WorkersTab() {
  const [stats, setStats] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, w, b] = await Promise.all([
      fetch("/api/admin/workers?action=stats").then((res) => res.json()),
      fetch("/api/admin/workers?action=workers").then((res) => res.json()),
      fetch("/api/admin/workers?action=bookings").then((res) => res.json()),
    ]);
    setStats(s.stats);
    setWorkers(w.workers || []);
    setBookings(b.bookings || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: number) {
    await fetch("/api/admin/workers?action=approve-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function reject(id: number) {
    await fetch("/api/admin/workers?action=reject-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function setAvailability(id: number, status: string) {
    await fetch("/api/admin/workers?action=set-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function updateBooking(id: number, status: string) {
    await fetch("/api/admin/workers?action=update-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  function formatDate(value: string) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(value: string) {
    if (!value) return "-";
    return String(value).slice(0, 5);
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Workers" value={stats?.total_workers ?? 0} />
        <StatCard label="Active" value={stats?.active_workers ?? 0} />
        <StatCard label="Pending Bookings" value={stats?.pending_bookings ?? 0} />
        <StatCard label="Confirmed Bookings" value={stats?.confirmed_bookings ?? 0} />
        <StatCard label="Pending Applications" value={stats?.pending_applications ?? 0} />
        <StatCard label="Completed Jobs" value={stats?.completed_jobs ?? 0} />
        <StatCard label="Payroll Pending" value={`PHP ${stats?.payroll_pending ?? 0}`} />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginBottom: 12 }}>Workers</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Availability</th>
              <th style={thStyle}>Verification</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id}>
                <td style={tdStyle}>
                  {w.first_name} {w.last_name}
                </td>
                <td style={tdStyle}>{String(w.position || "").replace(/_/g, " ")}</td>
                <td style={tdStyle}>{w.availability_status}</td>
                <td style={tdStyle}>{w.verification_status}</td>
                <td style={tdStyle}>
                  {w.verification_status === "pending" && (
                    <>
                      <button onClick={() => approve(w.id)} style={actionBtn}>
                        Approve
                      </button>
                      <button onClick={() => reject(w.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setAvailability(w.id, w.availability_status === "available" ? "unavailable" : "available")}
                    style={{
                      ...actionBtn,
                      background: w.availability_status === "available" ? "var(--surface-soft)" : "#1f6e34",
                      color: w.availability_status === "available" ? "var(--text-primary)" : "#fff",
                      borderColor: w.availability_status === "available" ? "var(--border-muted)" : "#1f6e34",
                    }}
                  >
                    {w.availability_status === "available" ? "Set Unavailable" : "Set Available"}
                  </button>
                </td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={5}>
                  No workers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>Client Booking Requests</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Approve, reject, or complete public workforce booking requests.</p>
          </div>
          <a href="/workforce" style={{ ...actionBtn, textDecoration: "none" }}>
            Open Worker Portal
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Role Needed</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Shift</th>
                <th style={thStyle}>Slots</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={tdStyle}>
                    <strong>{b.client_name}</strong>
                    <br />
                    <small style={{ color: "var(--text-muted)" }}>{b.email}</small>
                  </td>
                  <td style={tdStyle}>{b.contact_number}</td>
                  <td style={tdStyle}>{String(b.position || "").replace(/_/g, " ")}</td>
                  <td style={tdStyle}>{formatDate(b.job_date)}</td>
                  <td style={tdStyle}>
                    {formatTime(b.shift_start)} - {formatTime(b.shift_end)}
                  </td>
                  <td style={tdStyle}>{b.slots_needed}</td>
                  <td style={tdStyle}>
                    <span style={statusPillStyle(b.status)}>{b.status}</span>
                  </td>
                  <td style={tdStyle}>
                    {b.status === "pending" ? (
                      <>
                        <button onClick={() => updateBooking(b.id, "approved")} style={actionBtn}>
                          Approve
                        </button>
                        <button onClick={() => updateBooking(b.id, "rejected")} style={{ ...actionBtn, background: "#ef4444" }}>
                          Reject
                        </button>
                      </>
                    ) : b.status === "completed" || b.status === "cancelled" ? (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Done</span>
                    ) : (
                      <button onClick={() => updateBooking(b.id, "completed")} style={{ ...actionBtn, background: "#2563eb" }}>
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={8}>
                    No booking requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function statusPillStyle(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fef3c7", fg: "#92400e" },
    confirmed: { bg: "#dcfce7", fg: "#166534" },
    completed: { bg: "#dbeafe", fg: "#1d4ed8" },
    cancelled: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const color = colors[status] || { bg: "#f1f5f9", fg: "#334155" };
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: color.bg,
    color: color.fg,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
  };
}

const actionBtn: React.CSSProperties = {
  background: "#1f6e34",
  color: "#fff",
  border: "1px solid #1f6e34",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  marginRight: 6,
  lineHeight: 1.2,
};

/* ───────────────────── Overview tab ───────────────────── */

function formatOverviewDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function MiniBarChart({ title, data }: { title: string; data: Array<{ label: string; c: number | string }> }) {
  const max = Math.max(1, ...data.map((item) => Number(item.c || 0)));
  const rows = data.length ? data : [{ label: "No data", c: 0 }];
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{title}</h3>
      <div className="overview-bar-chart">
        {rows.map((item, index) => {
          const value = Number(item.c || 0);
          return (
            <div key={`${item.label}-${index}`} className="overview-bar-row">
              <span>{item.label}</span>
              <div className="overview-bar-track">
                <div className="overview-bar-fill" style={{ width: `${Math.max(5, (value / max) * 100)}%` }} />
              </div>
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusSummary({ title, rows, total }: { title: string; rows: Array<{ status: string; c: number | string }>; total: number }) {
  const denominator = Math.max(1, total);
  const visibleRows = rows.length ? rows : [{ status: "No data", c: 0 }];
  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{title}</h3>
      <div className="overview-status-stack">
        {visibleRows.map((row) => {
          const value = Number(row.c || 0);
          return (
            <div key={row.status} className="overview-status-row">
              <div>
                <strong>{String(row.status || "unknown").replace(/_/g, " ")}</strong>
                <span>{value} total</span>
              </div>
              <div className="overview-progress-track">
                <div className="overview-progress-fill" style={{ width: `${Math.min(100, (value / denominator) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview?action=summary", { cache: "no-store" })
      .then(async (r) => {
        const payload = await r.json().catch(() => ({ success: false, message: "Invalid overview response." }));
        if (!r.ok || !payload?.success) {
          console.error("[admin dashboard] overview fetch failed", { status: r.status, payload });
          setError(payload?.error || payload?.message || "Unable to load overview.");
        }
        setData(payload);
      })
      .catch((err) => {
        console.error("[admin dashboard] overview fetch crashed", err);
        setError(err instanceof Error ? err.message : "Unable to load overview.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton variant="overview" />;
  if (!data?.success) return <p>Unable to load overview{error ? `: ${error}` : "."}</p>;

  const s = data.stats;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const statCards = [
    ["Total Users", s.total_users],
    ["Active Users", s.active_users],
    ["Staff Members", s.staff_members],
    ["Available Workers", s.available_workers],
    ["Active Bookings", s.active_bookings],
    ["Pending Bookings", s.pending_bookings],
    ["Completed Bookings", s.completed_bookings],
    ["Cancelled Bookings", s.cancelled_bookings],
    ["Total Properties", s.total_properties],
    ["Available Units", s.available_units],
    ["Occupied Units", s.occupied_units],
    ["Contact Messages", s.total_contacts],
    ["News Articles", s.news_articles],
    ["Reviews", s.reviews],
  ];

  return (
    <div className="overview-dashboard">
      <section className="overview-hero">
        <div>
          <p className="overview-kicker">{now.toLocaleDateString()} - {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          <h2>{greeting}, Admin</h2>
          <p>Live Marajo Group operations snapshot across leads, bookings, workforce, contacts, and properties.</p>
        </div>
        <div className="overview-system-card">
          <span>System Status</span>
          <strong>Operational</strong>
          <small>{s.unread_notifications || 0} unread notifications</small>
        </div>
      </section>

      <div className="overview-quick-actions">
        <button onClick={() => onNavigate("units")} style={actionBtn}>Add Property</button>
        <button onClick={() => onNavigate("facilities")} style={actionBtn}>View Bookings</button>
        <button onClick={() => onNavigate("workers")} style={actionBtn}>Assign Worker</button>
        <button onClick={() => onNavigate("contacts")} style={actionBtn}>View Messages</button>
        <button onClick={() => onNavigate("notifications")} style={actionBtn}>Notifications</button>
      </div>

      <div className="overview-stat-grid">
        {statCards.map(([label, value]) => (
          <StatCard key={String(label)} label={String(label)} value={value ?? 0} />
        ))}
      </div>

      <div className="overview-grid-two">
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Bookings</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_bookings || []).map((b: any) => (
                <tr key={`${b.source}-${b.id}`}>
                  <td style={tdStyle}>{b.customer_name}</td>
                  <td style={tdStyle}>{b.source}</td>
                  <td style={tdStyle}>{formatOverviewDate(b.booking_date || b.created_at)}</td>
                  <td style={tdStyle}><span style={statusPillStyle(b.status)}>{b.status}</span></td>
                </tr>
              ))}
              {(!data.recent_bookings || data.recent_bookings.length === 0) && (
                <tr>
                  <td style={tdStyle} colSpan={4}>No recent bookings.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Users</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_users || []).map((u: any) => (
                <tr key={u.id}>
                  <td style={tdStyle}>
                    <span className="overview-user-avatar">{u.first_name?.charAt(0) || u.email?.charAt(0) || "U"}</span>
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") || "User"}
                  </td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{formatOverviewDate(u.created_at)}</td>
                </tr>
              ))}
              {(!data.recent_users || data.recent_users.length === 0) && (
                <tr>
                  <td style={tdStyle} colSpan={3}>No recent users.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-grid-three">
        <StatusSummary title="Worker Status" rows={data.worker_status || []} total={s.total_workers || 0} />
        <StatusSummary title="Property Summary" rows={data.property_status || []} total={s.total_units || 0} />
        <MiniBarChart title="Monthly Bookings" data={data.charts?.monthly_bookings || []} />
      </div>

      <div className="overview-grid-three">
        <MiniBarChart title="Monthly Users" data={data.charts?.monthly_users || []} />
        <MiniBarChart title="Contact Inquiries" data={data.charts?.monthly_inquiries || []} />
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Contact Messages</h3>
          <div className="overview-list">
            {(data.recent_contacts || []).map((c: any) => (
              <div key={c.id} className="overview-list-item">
                <strong>{c.name}</strong>
                <span>{c.property_interest || c.unit_interest || "General inquiry"}</span>
                <small>{c.email || "No email"} - {formatOverviewDate(c.last_inquiry_at || c.created_at)}</small>
              </div>
            ))}
            {(!data.recent_contacts || data.recent_contacts.length === 0) && <p>No recent contact messages.</p>}
          </div>
        </div>
      </div>

      <div className="overview-grid-two">
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h3>
          <div className="overview-timeline">
            {(data.activity || []).map((item: any, index: number) => (
              <div key={`${item.type}-${index}`} className="overview-timeline-item">
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </div>
            ))}
            {(!data.activity || data.activity.length === 0) && <p>No recent activity.</p>}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Notifications</h3>
          <div className="overview-list">
            {(data.notifications || []).map((n: any) => (
              <div key={n.id} className="overview-list-item">
                <strong>{n.title}</strong>
                <span>{n.message}</span>
                <small>{n.is_read ? "Read" : "Unread"} - {formatOverviewDate(n.created_at)}</small>
              </div>
            ))}
            {(!data.notifications || data.notifications.length === 0) && <p>No notifications.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Dashboard Overview</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>Real-estate sales pipeline summary.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Inquiries" value={s.total_inquiries} />
        <StatCard label="New" value={s.new_inquiries} />
        <StatCard label="Converted" value={s.converted_inquiries} />
        <StatCard label="Total Units" value={s.total_units} />
        <StatCard label="Available Units" value={s.available_units} />
        <StatCard label="Properties" value={s.total_properties} />
        <StatCard label="Upcoming Appointments" value={s.upcoming_appointments} />
        <StatCard label="Pending Tasks" value={s.pending_tasks} />
        <StatCard label="Total Contacts" value={s.total_contacts} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Inquiries</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Lead</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_inquiries || []).map((i: any) => (
                <tr key={i.id}>
                  <td style={tdStyle}>{i.name}</td>
                  <td style={tdStyle}>{i.unit_name || i.project || "—"}</td>
                  <td style={tdStyle}>{i.status}</td>
                </tr>
              ))}
              {(!data.recent_inquiries || data.recent_inquiries.length === 0) && (
                <tr>
                  <td style={tdStyle} colSpan={3}>No inquiries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Upcoming Appointments</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {(data.upcoming_appointments || []).map((a: any) => (
                <tr key={a.id}>
                  <td style={tdStyle}>{a.client_name || a.title}</td>
                  <td style={tdStyle}>{a.appt_date}</td>
                  <td style={tdStyle}>{a.appt_time}</td>
                </tr>
              ))}
              {(!data.upcoming_appointments || data.upcoming_appointments.length === 0) && (
                <tr>
                  <td style={tdStyle} colSpan={3}>No upcoming appointments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Pending Tasks</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Task</th>
              <th style={thStyle}>Due</th>
              <th style={thStyle}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {(data.upcoming_tasks || []).map((t: any) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.task}</td>
                <td style={tdStyle}>{t.due_date || "—"}</td>
                <td style={tdStyle}>{t.priority}</td>
              </tr>
            ))}
            {(!data.upcoming_tasks || data.upcoming_tasks.length === 0) && (
              <tr>
                <td style={tdStyle} colSpan={3}>No pending tasks.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Units tab ───────────────────── */

const UNIT_STATUSES = ["available", "reserved", "sold", "unavailable", "active", "inactive"];

function UnitsTab() {
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ name: "", type: "", building: "", location: "", price: "", status: "available", property_id: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/units?action=list").then((res) => res.json());
    setUnits(r.units || []);
    setProperties(r.properties || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = units.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.name, u.building, u.location, u.property_name].some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  async function createUnit() {
    if (!form.name.trim()) return;
    setSaving(true);
    const r = await fetch("/api/admin/units?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((res) => res.json());
    setSaving(false);
    if (r.success) {
      setForm({ name: "", type: "", building: "", location: "", price: "", status: "available", property_id: "" });
      setShowForm(false);
      load();
    } else {
      alert(r.message || "Failed to create unit.");
    }
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/units?action=update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function deleteUnit(id: number) {
    if (!confirm("Delete this unit?")) return;
    await fetch("/api/admin/units?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 18 }}>
        <button onClick={() => setShowForm((v) => !v)} style={actionBtn}>
          {showForm ? "Cancel" : "+ Add Unit"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <input style={inputStyle} placeholder="Unit name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle} placeholder="Type (e.g. Studio)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <input style={inputStyle} placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
          <input style={inputStyle} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input style={inputStyle} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <select style={inputStyle} value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
            <option value="">No property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {UNIT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={createUnit} disabled={saving} style={{ ...actionBtn, gridColumn: "1 / -1" }}>
            {saving ? "Saving…" : "Save Unit"}
          </button>
        </div>
      )}

      <input
        style={{ ...inputStyle, marginBottom: 12, width: "100%", maxWidth: 320 }}
        placeholder="Search units…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Property</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.property_name || "—"}</td>
                <td style={tdStyle}>{u.type || "—"}</td>
                <td style={tdStyle}>{u.location || u.building || "—"}</td>
                <td style={tdStyle}>{u.price || "—"}</td>
                <td style={tdStyle}>
                  <select value={u.status} onChange={(e) => updateStatus(u.id, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12 }}>
                    {UNIT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => deleteUnit(u.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>No units found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Calendar tab ───────────────────── */

function CalendarTab() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const r = await fetch(`/api/admin/calendar?action=events&month=${m}`).then((res) => res.json());
    setData(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(month);
  }, [month, load]);

  function shiftMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(d.toISOString().slice(0, 7));
  }

  const dates = data?.grouped ? Object.keys(data.grouped).sort() : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => shiftMonth(-1)} style={actionBtn}>‹ Prev</button>
          <span style={{ fontWeight: 600 }}>{month}</span>
          <button onClick={() => shiftMonth(1)} style={actionBtn}>Next ›</button>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton variant="calendar" />
      ) : dates.length === 0 ? (
        <div style={cardStyle}>No events scheduled this month.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dates.map((d) => (
            <div key={d} style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{d}</div>
              {data.grouped[d].map((ev: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: idx < data.grouped[d].length - 1 ? "1px solid var(--border-muted)" : "none",
                    fontSize: 13,
                  }}
                >
                  <span>
                    <strong style={{ color: ev.type === "parking" ? "#3b82f6" : "var(--mg-green)" }}>
                      {ev.type === "parking" ? "Parking" : "Appointment"}
                    </strong>{" "}
                    — {ev.label} {ev.sublabel ? `(${ev.sublabel})` : ""}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{ev.status}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Appointments tab ───────────────────── */

const APPT_STATUSES = ["upcoming", "completed", "cancelled"];

function AppointmentsTab() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ title: "", client_name: "", property_name: "", unit_name: "", appt_date: "", appt_time: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/appointments?action=list").then((res) => res.json());
    setAppointments(r.appointments || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createAppointment() {
    if (!form.title.trim() || !form.appt_date || !form.appt_time) {
      alert("Title, date, and time are required.");
      return;
    }
    setSaving(true);
    const r = await fetch("/api/admin/appointments?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((res) => res.json());
    setSaving(false);
    if (r.success) {
      setForm({ title: "", client_name: "", property_name: "", unit_name: "", appt_date: "", appt_time: "", notes: "" });
      setShowForm(false);
      load();
    } else {
      alert(r.message || "Failed to create appointment.");
    }
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/appointments?action=update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function deleteAppointment(id: number) {
    if (!confirm("Delete this appointment?")) return;
    await fetch("/api/admin/appointments?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Appointments</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Site visits and client meetings.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} style={actionBtn}>
          {showForm ? "Cancel" : "+ Add Appointment"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <input style={inputStyle} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input style={inputStyle} placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          <input style={inputStyle} placeholder="Property" value={form.property_name} onChange={(e) => setForm({ ...form, property_name: e.target.value })} />
          <input style={inputStyle} placeholder="Unit" value={form.unit_name} onChange={(e) => setForm({ ...form, unit_name: e.target.value })} />
          <input style={inputStyle} type="date" value={form.appt_date} onChange={(e) => setForm({ ...form, appt_date: e.target.value })} />
          <input style={inputStyle} type="time" value={form.appt_time} onChange={(e) => setForm({ ...form, appt_time: e.target.value })} />
          <input style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button onClick={createAppointment} disabled={saving} style={{ ...actionBtn, gridColumn: "1 / -1" }}>
            {saving ? "Saving…" : "Save Appointment"}
          </button>
        </div>
      )}

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Property / Unit</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td style={tdStyle}>{a.title}</td>
                <td style={tdStyle}>{a.client_name || a.lead_name || "—"}</td>
                <td style={tdStyle}>{[a.property_name, a.unit_name].filter(Boolean).join(" / ") || "—"}</td>
                <td style={tdStyle}>{a.appt_date}</td>
                <td style={tdStyle}>{a.appt_time}</td>
                <td style={tdStyle}>
                  <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12 }}>
                    {APPT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => deleteAppointment(a.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={7}>No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Contacts tab ───────────────────── */

function ContactsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ name: "", email: "", phone: "", property_interest: "", unit_interest: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/contacts?action=list").then((res) => res.json());
    setContacts(r.contacts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.email, c.phone, c.property_interest].some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  async function createContact() {
    if (!form.name.trim()) return;
    setSaving(true);
    const r = await fetch("/api/admin/contacts?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((res) => res.json());
    setSaving(false);
    if (r.success) {
      setForm({ name: "", email: "", phone: "", property_interest: "", unit_interest: "" });
      setShowForm(false);
      load();
    } else {
      alert(r.message || "Failed to create contact.");
    }
  }

  async function deleteContact(id: number) {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/admin/contacts?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Contacts</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>All client contacts captured from inquiries.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} style={actionBtn}>
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input style={inputStyle} placeholder="Property interest" value={form.property_interest} onChange={(e) => setForm({ ...form, property_interest: e.target.value })} />
          <input style={inputStyle} placeholder="Unit interest" value={form.unit_interest} onChange={(e) => setForm({ ...form, unit_interest: e.target.value })} />
          <button onClick={createContact} disabled={saving} style={{ ...actionBtn, gridColumn: "1 / -1" }}>
            {saving ? "Saving…" : "Save Contact"}
          </button>
        </div>
      )}

      <input
        style={{ ...inputStyle, marginBottom: 12, width: "100%", maxWidth: 320 }}
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Property Interest</th>
              <th style={thStyle}>Last Inquiry</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.email || "—"}</td>
                <td style={tdStyle}>{c.phone || "—"}</td>
                <td style={tdStyle}>{[c.property_interest, c.unit_interest].filter(Boolean).join(" / ") || "—"}</td>
                <td style={tdStyle}>{c.last_inquiry_at ? new Date(c.last_inquiry_at).toLocaleDateString() : "—"}</td>
                <td style={tdStyle}>
                  <button onClick={() => deleteContact(c.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>No contacts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────── Tasks tab ───────────────────── */

const TASK_PRIORITIES = ["high", "medium", "low"];
const priorityColor: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "var(--text-muted)" };

function TasksTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ task: "", due_date: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/tasks?action=list").then((res) => res.json());
    setTasks(r.tasks || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createTask() {
    if (!form.task.trim()) return;
    setSaving(true);
    const r = await fetch("/api/admin/tasks?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((res) => res.json());
    setSaving(false);
    if (r.success) {
      setForm({ task: "", due_date: "", priority: "medium" });
      setShowForm(false);
      load();
    } else {
      alert(r.message || "Failed to create task.");
    }
  }

  async function toggleTask(id: number) {
    await fetch("/api/admin/tasks?action=toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function deleteTask(id: number) {
    if (!confirm("Delete this task?")) return;
    await fetch("/api/admin/tasks?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="list" />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Tasks</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>To-dos and follow-ups.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} style={actionBtn}>
          {showForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 16, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
          <input style={inputStyle} placeholder="Task description" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} />
          <input style={inputStyle} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button onClick={createTask} disabled={saving} style={{ ...actionBtn, gridColumn: "1 / -1" }}>
            {saving ? "Saving…" : "Save Task"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              opacity: t.done ? 0.6 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t.id)} />
              <div>
                <div style={{ fontWeight: 600, textDecoration: t.done ? "line-through" : "none" }}>{t.task}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Due: {t.due_date || "—"} ·{" "}
                  <span style={{ color: priorityColor[t.priority] || "var(--text-muted)", fontWeight: 600 }}>{t.priority}</span>
                </div>
              </div>
            </div>
            <button onClick={() => deleteTask(t.id)} style={{ ...actionBtn, background: "#ef4444" }}>
              Delete
            </button>
          </div>
        ))}
        {tasks.length === 0 && <div style={cardStyle}>No tasks found.</div>}
      </div>
    </div>
  );
}

/* ───────────────────── Notifications tab ───────────────────── */

function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/notifications?action=list").then((res) => res.json());
    setNotifications(r.notifications || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: number) {
    await fetch("/api/admin/notifications?action=mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function markAllRead() {
    await fetch("/api/admin/notifications?action=mark-all-read", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    load();
  }

  async function deleteNotification(id: number) {
    await fetch("/api/admin/notifications?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) return <DashboardSkeleton variant="list" />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Notifications</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>System and lead activity alerts.</p>
        </div>
        <button onClick={markAllRead} style={actionBtn}>Mark all read</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              ...cardStyle,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: n.is_read ? "var(--surface)" : "var(--accent-soft)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} style={actionBtn}>
                  Mark read
                </button>
              )}
              <button onClick={() => deleteNotification(n.id)} style={{ ...actionBtn, background: "#ef4444" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div style={cardStyle}>No notifications.</div>}
      </div>
    </div>
  );
}

/* ───────────────────── Profile tab ───────────────────── */

function ProfileTab({ staff }: { staff: Staff }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/profile?action=me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.profile);
          setName(d.profile.name || "");
          setEmail(d.profile.email || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSaving(true);
    setSavedMsg("");
    const r = await fetch("/api/admin/profile?action=update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    }).then((res) => res.json());
    setSaving(false);
    setSavedMsg(r.success ? "Profile updated." : r.message || "Failed to update.");
  }

  async function changePassword() {
    setPwSaving(true);
    setPwMsg("");
    const r = await fetch("/api/admin/profile?action=change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }).then((res) => res.json());
    setPwSaving(false);
    setPwMsg(r.message || (r.success ? "Password changed." : "Failed to change password."));
    if (r.success) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  if (loading) return <DashboardSkeleton variant="profile" />;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Profile</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>
        Signed in as {staff.name} ({staff.role})
      </p>

      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Account Details</h3>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Name</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Email</label>
        <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={saveProfile} disabled={saving} style={actionBtn}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {savedMsg && <div style={{ fontSize: 12, color: "var(--mg-green)" }}>{savedMsg}</div>}
      </div>

      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Change Password</h3>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Current password</label>
        <input style={inputStyle} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>New password</label>
        <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={changePassword} disabled={pwSaving} style={actionBtn}>
          {pwSaving ? "Saving…" : "Change Password"}
        </button>
        {pwMsg && <div style={{ fontSize: 12, color: pwMsg.includes("incorrect") ? "#ef4444" : "var(--mg-green)" }}>{pwMsg}</div>}
      </div>
    </div>
  );
}
