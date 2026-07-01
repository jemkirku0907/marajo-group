"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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

const ADMIN_NAV_ITEMS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "units", label: "Units" },
  { id: "leads", label: "Leads" },
  { id: "parking", label: "Parking" },
  { id: "facilities", label: "Court Bookings" },
  { id: "workers", label: "Workers" },
  { id: "calendar", label: "Calendar" },
  { id: "appointments", label: "Appointments" },
  { id: "contacts", label: "Contacts" },
  { id: "tasks", label: "Tasks" },
  { id: "notifications", label: "Notifications" },
  { id: "profile", label: "Profile" },
];

const sidebarStyle: React.CSSProperties = {
  minWidth: 260,
  borderRight: "1px solid #e5e7eb",
  background: "#ffffff",
  padding: 24,
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
  color: "#475569",
  padding: "12px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const sidebarItemActiveStyle: React.CSSProperties = {
  ...sidebarItemStyle,
  background: "#ecfdf5",
  color: "#065f46",
  fontWeight: 700,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

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

  if (checking) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading…</div>;
  }
  if (!staff) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", color: "#111827" }}>
      <header
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "20px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #111827",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Marajo Group — Staff Portal</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
            Signed in as {staff.name} ({staff.role})
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
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 82px)" }}>
        <aside style={sidebarStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/assets/logo.png"
              alt="Marajo Group"
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Marajo Group</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Staff Portal</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Main
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {ADMIN_NAV_ITEMS.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={item.id === tab ? sidebarItemActiveStyle : sidebarItemStyle}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Tools
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {ADMIN_NAV_ITEMS.slice(8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={item.id === tab ? sidebarItemActiveStyle : sidebarItemStyle}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px 28px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>{ADMIN_NAV_ITEMS.find((item) => item.id === tab)?.label}</h1>
                <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14 }}>
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
            </div>
          </div>

          <main style={{ padding: 28, flex: 1 }}>
            {tab === "overview" && <OverviewTab />}
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
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  boxShadow: "0 1px 3px rgba(0,0,0,.08)",
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #e5e7eb", color: "#6b7280", fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid #f3f4f6" };

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 13,
  color: "#111827",
  background: "#fff",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</div>
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

  if (loading) return <p>Loading leads…</p>;

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
            style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, minWidth: 220 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }}
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
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{l.email || l.phone}</div>
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
                      background: statusColor[l.status] || "#6b7280",
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
        style={{ width: 420, maxWidth: "100%", background: "#fff", height: "100%", overflowY: "auto", padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Lead Details</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>

        {loading && <p>Loading…</p>}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{data.lead.name}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {data.lead.email} {data.lead.phone ? `· ${data.lead.phone}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {data.lead.project} {data.lead.unit_name ? `· ${data.lead.unit_name}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Lead score: {data.lead.lead_score ?? 0}</div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#374151" }}>UPDATE STATUS</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, marginBottom: 8 }}
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
                style={{ width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, marginBottom: 8 }}
              />
              <button onClick={saveStatus} disabled={saving} style={{ ...actionBtn, width: "100%" }}>
                {saving ? "Saving…" : "Save Status"}
              </button>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#374151" }}>ACTIVITY TIMELINE</div>
              {data.timeline.length === 0 && <p style={{ fontSize: 13, color: "#6b7280" }}>No activity yet.</p>}
              {data.timeline.map((a: any) => (
                <div key={a.id} style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{a.created_at}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.staff_name}</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{a.details}</div>
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

  if (loading) return <p>Loading parking data…</p>;

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

  if (loading) return <p>Loading court booking data…</p>;

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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, w] = await Promise.all([
      fetch("/api/admin/workers?action=stats").then((res) => res.json()),
      fetch("/api/admin/workers?action=workers").then((res) => res.json()),
    ]);
    setStats(s.stats);
    setWorkers(w.workers || []);
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

  if (loading) return <p>Loading workforce data…</p>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Workers" value={stats?.total_workers ?? 0} />
        <StatCard label="Active" value={stats?.active_workers ?? 0} />
        <StatCard label="Pending Applications" value={stats?.pending_applications ?? 0} />
        <StatCard label="Completed Jobs" value={stats?.completed_jobs ?? 0} />
        <StatCard label="Payroll Pending" value={`₱${stats?.payroll_pending ?? 0}`} />
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
                <td style={tdStyle}>{w.position}</td>
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
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  marginRight: 6,
};

/* ───────────────────── Overview tab ───────────────────── */

function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview?action=summary")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading overview…</p>;
  if (!data?.success) return <p>Unable to load overview.</p>;

  const s = data.stats;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Dashboard Overview</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 18 }}>Real-estate sales pipeline summary.</p>

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

  if (loading) return <p>Loading units…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Units</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>Manage assigned units across all buildings.</p>
        </div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Calendar</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>Schedule overview — appointments &amp; parking reservations.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => shiftMonth(-1)} style={actionBtn}>‹ Prev</button>
          <span style={{ fontWeight: 600 }}>{month}</span>
          <button onClick={() => shiftMonth(1)} style={actionBtn}>Next ›</button>
        </div>
      </div>

      {loading ? (
        <p>Loading calendar…</p>
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
                    borderBottom: idx < data.grouped[d].length - 1 ? "1px solid #f3f4f6" : "none",
                    fontSize: 13,
                  }}
                >
                  <span>
                    <strong style={{ color: ev.type === "parking" ? "#3b82f6" : "#16a34a" }}>
                      {ev.type === "parking" ? "Parking" : "Appointment"}
                    </strong>{" "}
                    — {ev.label} {ev.sublabel ? `(${ev.sublabel})` : ""}
                  </span>
                  <span style={{ color: "#6b7280" }}>{ev.status}</span>
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

  if (loading) return <p>Loading appointments…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Appointments</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>Site visits and client meetings.</p>
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

  if (loading) return <p>Loading contacts…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Contacts</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>All client contacts captured from inquiries.</p>
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
const priorityColor: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

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

  if (loading) return <p>Loading tasks…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Tasks</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>To-dos and follow-ups.</p>
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
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Due: {t.due_date || "—"} ·{" "}
                  <span style={{ color: priorityColor[t.priority] || "#6b7280", fontWeight: 600 }}>{t.priority}</span>
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

  if (loading) return <p>Loading notifications…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Notifications</h2>
          <p style={{ color: "#6b7280", fontSize: 13 }}>System and lead activity alerts.</p>
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
              background: n.is_read ? "#fff" : "#f0fdf4",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
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

  if (loading) return <p>Loading profile…</p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Profile</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 18 }}>
        Signed in as {staff.name} ({staff.role})
      </p>

      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Account Details</h3>
        <label style={{ fontSize: 12, color: "#6b7280" }}>Name</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <label style={{ fontSize: 12, color: "#6b7280" }}>Email</label>
        <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={saveProfile} disabled={saving} style={actionBtn}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {savedMsg && <div style={{ fontSize: 12, color: "#16a34a" }}>{savedMsg}</div>}
      </div>

      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Change Password</h3>
        <label style={{ fontSize: 12, color: "#6b7280" }}>Current password</label>
        <input style={inputStyle} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <label style={{ fontSize: 12, color: "#6b7280" }}>New password</label>
        <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={changePassword} disabled={pwSaving} style={actionBtn}>
          {pwSaving ? "Saving…" : "Change Password"}
        </button>
        {pwMsg && <div style={{ fontSize: 12, color: pwMsg.includes("incorrect") ? "#ef4444" : "#16a34a" }}>{pwMsg}</div>}
      </div>
    </div>
  );
}
