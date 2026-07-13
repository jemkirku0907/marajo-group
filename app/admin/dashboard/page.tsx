"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeController from "@/components/ThemeController";

type Staff = { id: number; name: string; role: string; role_code: string; company_code?: string };
type Tab =
  | "overview"
  | "units"
  | "leads"
  | "tenants"
  | "parking"
  | "facilities"
  | "workers"
  | "calendar"
  | "appointments"
  | "contacts"
  | "tasks"
  | "receipts"
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
  | "receipt"
  | "bell"
  | "user"
  | "logOut";

const ADMIN_NAV_ITEMS: Array<{ id: Tab; label: string; icon: AdminIcon }> = [
  { id: "overview", label: "Overview", icon: "layout" },
  { id: "units", label: "Units", icon: "building" },
  { id: "leads", label: "Leads", icon: "users" },
  { id: "tenants", label: "Tenants", icon: "users" },
  { id: "parking", label: "Parking", icon: "car" },
  { id: "facilities", label: "Court Bookings", icon: "court" },
  { id: "workers", label: "Workers", icon: "tool" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "appointments", label: "Appointments", icon: "clock" },
  { id: "contacts", label: "Contacts", icon: "mail" },
  { id: "tasks", label: "Tasks", icon: "check" },
  { id: "receipts", label: "Receipts", icon: "receipt" },
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
    receipt: (
      <>
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2z" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
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
              {ADMIN_NAV_ITEMS.slice(0, 9).map((item) => (
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
              {ADMIN_NAV_ITEMS.slice(9).map((item) => (
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
                  {tab === "tenants" && "Verify Marajo Tower tenant/member access."}
                  {tab === "parking" && "Manage parking reservations and occupancy."}
                  {tab === "facilities" && "Handle court bookings and facility schedules."}
                  {tab === "workers" && "Manage workforce approvals and assignments."}
                  {tab === "calendar" && "View appointments and reservation dates."}
                  {tab === "appointments" && "Schedule and update client visits."}
                  {tab === "contacts" && "Keep contact records and inquiries organized."}
                  {tab === "tasks" && "Track pending tasks and follow-ups."}
                  {tab === "receipts" && "Search, send, and manage booking invoices and receipts."}
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
            {tab === "tenants" && <TenantsTab />}
            {tab === "parking" && <ParkingTab />}
            {tab === "facilities" && <FacilitiesTab />}
            {tab === "workers" && <WorkersTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "appointments" && <AppointmentsTab />}
            {tab === "contacts" && <ContactsTab />}
            {tab === "tasks" && <TasksTab />}
            {tab === "receipts" && <ReceiptsTab />}
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

function TenantsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/admin/tenants?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setRows(data.success ? data.tenants || [] : []);
        if (!data.success) setMessage(data.message || "Unable to load tenant memberships.");
      })
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateTenant(id: number, action: "approve" | "reject" | "deactivate" | "pending") {
    setMessage("");
    const res = await fetch(`/api/admin/tenants?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setMessage(data.message || (data.success ? "Tenant updated." : "Unable to update tenant."));
    if (data.success) load();
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--heading-color)" }}>Tenant Verification</h3>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              Approve verified Marajo Tower tenants before they can submit facility, parking, and workforce requests.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={inputStyle}
              placeholder="Search tenant, company, unit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn-primary" type="button" onClick={load}>
              Refresh
            </button>
          </div>
        </div>
        {message && <p style={{ margin: "12px 0 0", color: "var(--mg-green)", fontWeight: 700 }}>{message}</p>}
      </div>

      <div style={cardStyle}>
        {loading ? (
          <DashboardSkeleton variant="table" />
        ) : rows.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)" }}>No tenant membership records found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tenant</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Floor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Updated</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>
                    <strong>{row.full_name}</strong>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{row.email}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{row.phone || "No phone"}</div>
                  </td>
                  <td style={tdStyle}>
                    <strong>{row.company_name}</strong>
                  </td>
                  <td style={tdStyle}>
                    {row.floor_number || "-"}
                  </td>
                  <td style={tdStyle}>
                    <span className={`membership-status-pill status-${row.membership_status}`}>{row.membership_status}</span>
                  </td>
                  <td style={tdStyle}>{row.updated_at ? new Date(row.updated_at).toLocaleString() : "-"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {row.membership_status !== "active" && (
                        <button className="btn-primary" type="button" onClick={() => updateTenant(row.id, "approve")}>
                          Approve
                        </button>
                      )}
                      {row.membership_status === "active" ? (
                        <button className="btn-secondary" type="button" onClick={() => updateTenant(row.id, "deactivate")}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="btn-secondary" type="button" onClick={() => updateTenant(row.id, "reject")}>
                          Reject
                        </button>
                      )}
                      {row.membership_status !== "pending" && (
                        <button className="btn-secondary" type="button" onClick={() => updateTenant(row.id, "pending")}>
                          Mark Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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

function money(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "N/A";
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatOverviewDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function overviewTrend(current: number, previous: number) {
  if (!previous && !current) return "No comparison data";
  if (!previous) return `${current} new this month`;
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}% vs last month`;
}

const overviewCardBase: React.CSSProperties = {
  ...cardStyle,
  background: "var(--admin-card)",
  color: "var(--admin-text)",
  border: "1px solid var(--admin-border)",
  borderRadius: 18,
  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.22)",
  overflow: "hidden",
};

function OverviewSummaryCard({
  icon,
  label,
  value,
  detail,
  trend,
}: {
  icon: string;
  label: string;
  value: string | number;
  detail: string;
  trend?: string;
}) {
  return (
    <article style={{ ...overviewCardBase, minHeight: 154 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <div>
          <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: 12, fontWeight: 800 }}>{label}</p>
          <strong style={{ display: "block", marginTop: 10, color: "var(--admin-heading)", fontSize: "clamp(1.65rem, 2vw, 2.15rem)", lineHeight: 1 }}>
            {value}
          </strong>
        </div>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(119, 255, 66, 0.12)",
            color: "var(--admin-accent)",
            fontSize: 20,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: 12, lineHeight: 1.45 }}>{detail}</p>
      {trend && <small style={{ display: "block", marginTop: 8, color: "var(--admin-accent)", fontWeight: 800 }}>{trend}</small>}
    </article>
  );
}

function OverviewActivityChart({ data }: { data: Array<{ label: string; c: number | string }> }) {
  const rows = data.length ? data : [{ label: "No data", c: 0 }];
  const max = Math.max(1, ...rows.map((item) => Number(item.c || 0)));
  return (
    <section style={{ ...overviewCardBase, minHeight: 310 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 22 }}>
        <div>
          <h3 style={{ margin: 0, color: "var(--admin-heading)", fontSize: 18 }}>Lead Activity</h3>
          <p style={{ margin: "5px 0 0", color: "var(--admin-muted)", fontSize: 12 }}>Inquiry volume over the last 30 days</p>
        </div>
        <span style={{ color: "var(--admin-accent)", fontSize: 12, fontWeight: 800 }}>Live data</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, rows.length)}, minmax(24px, 1fr))`, alignItems: "end", gap: 10, minHeight: 190 }}>
        {rows.map((item, index) => {
          const value = Number(item.c || 0);
          return (
            <div key={`${item.label}-${index}`} style={{ display: "grid", gap: 8, alignItems: "end", minWidth: 0 }}>
              <div
                title={`${item.label}: ${value}`}
                style={{
                  height: `${Math.max(8, (value / max) * 170)}px`,
                  borderRadius: "12px 12px 5px 5px",
                  background: value ? "linear-gradient(180deg, var(--admin-accent), var(--mg-green))" : "rgba(255,255,255,0.08)",
                  boxShadow: value ? "0 14px 26px rgba(119, 255, 66, 0.14)" : "none",
                }}
              />
              <small style={{ color: "var(--admin-muted)", fontSize: 10, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.label}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OverviewListPanel({ title, items }: { title: string; items: Array<{ name: string; meta: string; stat: string | number }> }) {
  return (
    <section style={{ ...overviewCardBase, minHeight: 310 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ margin: 0, color: "var(--admin-heading)", fontSize: 17 }}>{title}</h3>
        <span style={{ color: "var(--admin-accent)", fontSize: 12, fontWeight: 800 }}>Top 5</span>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {(items.length ? items : [{ name: "No data yet", meta: "Recent activity will appear here", stat: "-" }]).map((item, index) => (
          <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", gap: 12, alignItems: "center" }}>
            <span style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(119, 255, 66, 0.12)", color: "var(--admin-accent)", fontWeight: 900 }}>
              {item.name.charAt(0).toUpperCase()}
            </span>
            <span style={{ minWidth: 0 }}>
              <strong style={{ display: "block", color: "var(--admin-heading)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</strong>
              <small style={{ color: "var(--admin-muted)" }}>{item.meta}</small>
            </span>
            <strong style={{ color: "var(--admin-heading)", fontSize: 13 }}>{item.stat}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewRightRail({
  recentRows,
  topProperties,
  onNavigate,
}: {
  recentRows: Array<{ key: string; type: string; name: string; property: string; date: string; status: string }>;
  topProperties: Array<{ name: string; meta: string; stat: string | number }>;
  onNavigate: (tab: Tab) => void;
}) {
  const notifications = recentRows.slice(0, 4);
  const activities = topProperties.slice(0, 4);
  return (
    <aside className="overview-right-rail">
      <section className="overview-rail-section">
        <div className="overview-rail-heading">
          <h3>Notifications</h3>
          <button type="button" onClick={() => onNavigate("notifications")}>View</button>
        </div>
        <div className="overview-rail-list">
          {(notifications.length ? notifications : [{ key: "empty", type: "System", name: "No new notifications", property: "Updates will appear here", date: "", status: "Ready" }]).map((item) => (
            <button className="overview-rail-item" key={item.key} type="button" onClick={() => onNavigate(item.type === "Lead" ? "leads" : "parking")}>
              <span className="overview-rail-dot">{item.type.charAt(0)}</span>
              <span>
                <strong>{item.name || item.type}</strong>
                <small>{item.property} · {item.status}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overview-rail-section">
        <div className="overview-rail-heading">
          <h3>Activities</h3>
        </div>
        <div className="overview-rail-list">
          {(activities.length ? activities : [{ name: "No inquiries yet", meta: "Property activity", stat: "-" }]).map((item, index) => (
            <div className="overview-rail-item" key={`${item.name}-${index}`}>
              <span className="overview-rail-dot">{item.name.charAt(0).toUpperCase()}</span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.meta} · {item.stat}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="overview-rail-section">
        <div className="overview-rail-heading">
          <h3>Quick Actions</h3>
        </div>
        <div className="overview-quick-action-list">
          {([
            ["View Leads", "leads"],
            ["Manage Bookings", "parking"],
            ["Add Worker", "workers"],
            ["Invoices", "receipts"],
          ] as Array<[string, Tab]>).map(([label, target]) => (
            <button key={label} type="button" onClick={() => onNavigate(target)}>
              {label}
              <span>-&gt;</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
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
  const trends = data.trends || {};
  const topProperties = (data.top_properties || []).map((item: any) => ({
    name: item.name || "General Inquiry",
    meta: "Property inquiries",
    stat: Number(item.c || 0),
  }));
  const recentRows = [
    ...(data.recent_inquiries || []).map((item: any) => ({
      key: `lead-${item.id}`,
      type: "Lead",
      name: item.name,
      property: item.project || item.unit_name || "Property inquiry",
      date: item.created_at,
      status: item.status || "New",
    })),
    ...(data.recent_bookings || []).map((item: any) => ({
      key: `${item.source}-${item.id}`,
      type: item.source || "Booking",
      name: item.customer_name,
      property: item.property_name || item.worker_name || "Booking",
      date: item.created_at || item.booking_date,
      status: item.status || "Pending",
    })),
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 7);

  return (
    <div className="overview-dashboard overview-dashboard-dark">
      <div className="overview-main-column">
        <div className="overview-stat-grid">
          <OverviewSummaryCard
            icon="L"
            label="Total Leads"
            value={s.total_inquiries || 0}
            detail={`${s.new_inquiries || 0} new, ${s.converted_inquiries || 0} converted`}
            trend={overviewTrend(Number(trends.current_month_inquiries || 0), Number(trends.previous_month_inquiries || 0))}
          />
          <OverviewSummaryCard
            icon="U"
            label="Total Units"
            value={s.total_units || 0}
            detail={`${s.available_units || 0} available, ${s.occupied_units || 0} occupied/reserved/sold`}
          />
          <OverviewSummaryCard
            icon="B"
            label="Total Bookings"
            value={s.total_bookings || 0}
            detail={`${s.active_bookings || 0} active, ${s.pending_bookings || 0} pending`}
            trend={overviewTrend(Number(trends.current_month_bookings || 0), Number(trends.previous_month_bookings || 0))}
          />
          <OverviewSummaryCard
            icon="A"
            label="Upcoming Appointments"
            value={s.upcoming_appointments || 0}
            detail={`${s.appointments_this_week || 0} scheduled in the next 7 days`}
          />
        </div>

        <div className="overview-grid-two">
          <OverviewActivityChart data={data.charts?.lead_activity || []} />
          <OverviewListPanel title="Top Properties by Inquiries" items={topProperties} />
        </div>

        <section style={overviewCardBase}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: "var(--admin-heading)", fontSize: 17 }}>Recent Activity</h3>
              <p style={{ margin: "5px 0 0", color: "var(--admin-muted)", fontSize: 12 }}>Latest leads and booking movement</p>
            </div>
            <button onClick={() => onNavigate("leads")} style={{ ...actionBtn, marginRight: 0, padding: "8px 11px" }}>View all</button>
          </div>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ ...tableStyle, minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "34%" }}>Name</th>
                  <th style={{ ...thStyle, width: "28%" }}>Property / Type</th>
                  <th style={{ ...thStyle, width: "18%" }}>Date</th>
                  <th style={{ ...thStyle, width: "20%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((item) => (
                  <tr key={item.key}>
                    <td style={tdStyle}>
                      <strong>{item.name || "Unknown"}</strong>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>{item.type}</small>
                    </td>
                    <td style={tdStyle}>{item.property}</td>
                    <td style={tdStyle}>{formatOverviewDate(item.date)}</td>
                    <td style={tdStyle}><span style={statusPillStyle(String(item.status).toLowerCase())}>{item.status}</span></td>
                  </tr>
                ))}
                {recentRows.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={4}>No recent activity yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <OverviewRightRail recentRows={recentRows} topProperties={topProperties} onNavigate={onNavigate} />
    </div>
  );
}

/* ───────────────────── Units tab ───────────────────── */

// Future integration point: Inventory system (in progress, separate project)
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

const WORK_REQUEST_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "declined", label: "Declined" },
];

const requestStatusColor: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#2563eb",
  in_progress: "var(--mg-green)",
  done: "#16a34a",
  declined: "#dc2626",
};

function TasksTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    employee: "all",
    date_from: "",
    date_to: "",
    sort: "oldest-active",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      action: "list",
      status: filters.status,
      employee: filters.employee,
      date_from: filters.date_from,
      date_to: filters.date_to,
      sort: filters.sort,
    });
    const [requestRes, employeeRes] = await Promise.all([
      fetch(`/api/admin/tasks?${params.toString()}`).then((res) => res.json()),
      fetch("/api/admin/tasks?action=employees").then((res) => res.json()),
    ]);
    setRequests(requestRes.requests || []);
    setEmployees(employeeRes.employees || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateRequest(id: number, patch: Record<string, any>) {
    setSavingId(id);
    const r = await fetch("/api/admin/tasks?action=update-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).then((res) => res.json());
    setSavingId(null);
    if (!r.success) {
      alert(r.message || "Failed to update request.");
      return;
    }
    load();
  }

  if (loading) return <DashboardSkeleton variant="list" />;

  const counts = WORK_REQUEST_STATUSES.reduce((acc, s) => {
    acc[s.value] = requests.filter((r) => r.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Workforce Request Tracking</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Monitor client requests, assignments, and elapsed time by status.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {WORK_REQUEST_STATUSES.map((s) => (
          <div key={s.value} style={{ ...cardStyle, padding: 16, borderLeft: `4px solid ${requestStatusColor[s.value]}` }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{counts[s.value] || 0}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
        <select style={inputStyle} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="all">All statuses</option>
          {WORK_REQUEST_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select style={inputStyle} value={filters.employee} onChange={(e) => setFilters({ ...filters, employee: e.target.value })}>
          <option value="all">All employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {[e.first_name, e.last_name].filter(Boolean).join(" ")}{e.position ? ` - ${e.position}` : ""}
            </option>
          ))}
        </select>
        <input style={inputStyle} type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        <input style={inputStyle} type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        <select style={inputStyle} value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="oldest-active">Oldest active first</option>
          <option value="newest">Newest first</option>
          <option value="status">Status order</option>
        </select>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Client Request</th>
              <th style={thStyle}>Schedule</th>
              <th style={thStyle}>Assigned Employee</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Timing</th>
              <th style={thStyle}>Admin Notes</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{request.client_name || "Unnamed client"}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {request.position} - {request.slots_needed || 1} worker(s)
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{request.email || request.contact_number || "No contact"}</div>
                </td>
                <td style={tdStyle}>
                  <div>{request.job_date ? new Date(request.job_date).toLocaleDateString() : "No date"}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {[request.shift_start, request.shift_end].filter(Boolean).join(" - ") || "No shift time"}
                  </div>
                </td>
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, minWidth: 160 }}
                    value={request.assigned_worker_id || ""}
                    disabled={savingId === request.id}
                    onChange={(e) => updateRequest(request.id, { assigned_worker_id: e.target.value || null })}
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {[e.first_name, e.last_name].filter(Boolean).join(" ")}{e.position ? ` - ${e.position}` : ""}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, minWidth: 130, borderColor: requestStatusColor[request.status] || "var(--border)" }}
                    value={request.status}
                    disabled={savingId === request.id}
                    onChange={(e) => updateRequest(request.id, { status: e.target.value })}
                  >
                    {WORK_REQUEST_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{request.current_status_age} in {request.status_label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Total: {request.total_elapsed}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    Pending {request.pending_time} - Accepted {request.accepted_time} - Active {request.in_progress_time}
                  </div>
                </td>
                <td style={tdStyle}>
                  <input
                    style={{ ...inputStyle, minWidth: 180 }}
                    defaultValue={request.admin_notes || ""}
                    placeholder="Reminder or note"
                    onBlur={(e) => {
                      if (e.target.value !== (request.admin_notes || "")) {
                        updateRequest(request.id, { admin_notes: e.target.value });
                      }
                    }}
                  />
                  {request.worker_notes && (
                    <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 12 }}>
                      Worker note: {request.worker_notes}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  No workforce requests match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ ...cardStyle, marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
        Tip: sort by oldest active first to find requests that need a reminder. Timing is computed from submitted, accepted, in-progress, and done timestamps.
      </div>
    </div>
  );
}
/* ───────────────────── Notifications tab ───────────────────── */

function ReceiptsTab() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    payment_status: "all",
    source: "all",
    date_from: "",
    date_to: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
    });
    const res = await fetch(`/api/admin/receipts?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setReceipts(data.success ? data.receipts || [] : []);
    setSummary(data.summary || null);
    if (!data.success) setMessage(data.message || "Unable to load receipts.");
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function receiptAction(row: any, action: string, paymentStatus?: string) {
    const key = `${row.source}-${row.id}-${action}-${paymentStatus || ""}`;
    setSavingKey(key);
    setMessage("");
    const res = await fetch(`/api/admin/receipts?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, source: row.source, payment_status: paymentStatus }),
    });
    const data = await res.json();
    setMessage(data.message || (data.success ? "Updated." : "Unable to update receipt."));
    setSavingKey("");
    if (data.success) load();
  }

  const pill = (value: string) => {
    const normalized = String(value || "unpaid").toLowerCase();
    const paid = normalized === "paid" || normalized === "waived";
    return <span style={statusPillStyle(paid ? "confirmed" : "pending")}>{paid ? "Paid" : "Unpaid"}</span>;
  };

  if (loading) return <DashboardSkeleton variant="table" />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="Receipts" value={summary?.total ?? 0} />
        <StatCard label="Paid" value={summary?.paid ?? 0} />
        <StatCard label="Unpaid" value={summary?.unpaid ?? 0} />
        <StatCard label="Total Value" value={money(summary?.amount ?? 0)} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>Invoices & Receipts</h3>
            <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              Search booking receipts by tenant/customer, date, payment status, or booking type.
            </p>
          </div>
          <button onClick={load} style={actionBtn} type="button">Refresh</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.3fr) repeat(4, minmax(130px, .8fr))", gap: 10, marginBottom: 14 }}>
          <input style={inputStyle} value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="Search tenant, email, reference" />
          <select style={inputStyle} value={filters.source} onChange={(e) => setFilter("source", e.target.value)}>
            <option value="all">All types</option>
            <option value="parking">Parking</option>
            <option value="court">Court</option>
            <option value="workforce">Workforce</option>
          </select>
          <select style={inputStyle} value={filters.payment_status} onChange={(e) => setFilter("payment_status", e.target.value)}>
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <input style={inputStyle} type="date" value={filters.date_from} onChange={(e) => setFilter("date_from", e.target.value)} />
          <input style={inputStyle} type="date" value={filters.date_to} onChange={(e) => setFilter("date_to", e.target.value)} />
        </div>

        {message && (
          <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: "var(--surface-soft)", color: "var(--text-primary)", fontSize: 13 }}>
            {message}
          </div>
        )}

        <table style={{ ...tableStyle, minWidth: 980 }}>
          <thead>
            <tr>
              <th style={thStyle}>Reference</th>
              <th style={thStyle}>Tenant / Customer</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Request</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((row) => {
              const keyBase = `${row.source}-${row.id}`;
              const canManagePayment = row.source === "parking" || row.source === "court";
              return (
                <tr key={keyBase}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 800 }}>{row.reference}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{row.item_name}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700 }}>{row.customer_name || "N/A"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{row.email || "No email"}</div>
                  </td>
                  <td style={tdStyle}>{row.source_label}</td>
                  <td style={tdStyle}>
                    <div>{shortDate(row.service_date)}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Issued {shortDate(row.invoice_date)}</div>
                  </td>
                  <td style={tdStyle}>{row.amount == null ? "N/A" : money(row.amount)}</td>
                  <td style={tdStyle}>{pill(row.payment_status)}</td>
                  <td style={tdStyle}><span style={statusPillStyle(String(row.request_status || "pending"))}>{row.request_status || "pending"}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => receiptAction(row, "send-receipt")} disabled={savingKey === `${keyBase}-send-receipt-`} style={actionBtn} type="button">
                      Send receipt
                    </button>
                    {canManagePayment && (
                      <>
                        <button onClick={() => receiptAction(row, "set-payment-status", "paid")} disabled={savingKey === `${keyBase}-set-payment-status-paid`} style={{ ...actionBtn, background: "#2563eb", borderColor: "#2563eb" }} type="button">
                          Mark paid
                        </button>
                        <button onClick={() => receiptAction(row, "set-payment-status", "pending")} disabled={savingKey === `${keyBase}-set-payment-status-pending`} style={{ ...actionBtn, background: "transparent", color: "var(--text-primary)", borderColor: "var(--border-muted)" }} type="button">
                          Mark unpaid
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {receipts.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={8}>No invoices or receipts match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

