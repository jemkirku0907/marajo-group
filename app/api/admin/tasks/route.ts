import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { sendWorkerBookingAcceptedNotice } from "@/lib/mail";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

const PRIORITIES = ["high", "medium", "low"];
const TRACKED_STATUSES = ["pending", "accepted", "in_progress", "done", "declined"] as const;
type TrackedStatus = (typeof TRACKED_STATUSES)[number];

async function tableExists(tableName: string) {
  const row = await db.queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ?
     ) AS exists`,
    [tableName]
  );
  return !!row?.exists;
}

async function ensureWorkerBookingTrackingColumns() {
  if (!(await tableExists("worker_bookings"))) return false;

  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS assigned_worker_id INTEGER NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS in_progress_at TIMESTAMPTZ NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS done_at TIMESTAMPTZ NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL");
  await db.execute("ALTER TABLE worker_bookings ADD COLUMN IF NOT EXISTS worker_notes TEXT NULL");
  return true;
}

function normalizeStatus(status: string | null | undefined): TrackedStatus {
  const value = String(status ?? "pending").toLowerCase();
  if (value === "confirmed" || value === "approved" || value === "accepted") return "accepted";
  if (value === "completed" || value === "done") return "done";
  if (value === "declined" || value === "rejected") return "declined";
  if (value === "in_progress") return "in_progress";
  return "pending";
}

function statusLabel(status: TrackedStatus) {
  const labels: Record<TrackedStatus, string> = {
    pending: "Pending",
    accepted: "Accepted",
    in_progress: "In Progress",
    done: "Done",
    declined: "Declined",
  };
  return labels[status];
}

function durationLabel(start?: string | null, end?: string | null) {
  if (!start) return "Not started";
  const started = new Date(start).getTime();
  const ended = end ? new Date(end).getTime() : Date.now();
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended < started) return "0m";
  const minutes = Math.max(0, Math.round((ended - started) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function trackingFor(row: any) {
  const status = normalizeStatus(row.status);
  const createdAt = row.created_at ?? null;
  const acceptedAt = row.accepted_at ?? null;
  const inProgressAt = row.in_progress_at ?? null;
  const doneAt = row.done_at ?? null;
  const declinedAt = row.declined_at ?? null;

  const pendingEnd = acceptedAt || inProgressAt || doneAt || declinedAt || (status === "pending" ? null : row.updated_at);
  const acceptedEnd = inProgressAt || doneAt || declinedAt || (status === "accepted" ? null : row.updated_at);
  const progressEnd = doneAt || declinedAt || (status === "in_progress" ? null : row.updated_at);
  const currentSince =
    status === "pending" ? createdAt :
    status === "accepted" ? acceptedAt || createdAt :
    status === "in_progress" ? inProgressAt || acceptedAt || createdAt :
    status === "declined" ? declinedAt || acceptedAt || createdAt :
    doneAt || inProgressAt || acceptedAt || createdAt;

  return {
    status,
    status_label: statusLabel(status),
    total_elapsed: durationLabel(createdAt, doneAt || declinedAt),
    current_status_age: durationLabel(currentSince, status === "done" ? doneAt : status === "declined" ? declinedAt : null),
    pending_time: durationLabel(createdAt, pendingEnd),
    accepted_time: acceptedAt ? durationLabel(acceptedAt, acceptedEnd) : "Not started",
    in_progress_time: inProgressAt ? durationLabel(inProgressAt, progressEnd) : "Not started",
  };
}

async function getEmployees() {
  if (!(await tableExists("workers"))) return [];
  return db.query(
    `SELECT w.id, w.position, w.availability_status, w.verification_status,
            u.first_name, u.last_name, u.email
     FROM workers w
     JOIN users u ON u.id = w.user_id
     WHERE COALESCE(w.verification_status, 'pending') = 'approved'
     ORDER BY u.first_name ASC, u.last_name ASC`
  );
}

/**
 * GET /api/admin/tasks
 *   ?action=list -> workforce client request tracking
 *   ?action=employees -> assignable employees
 *   ?action=manual-list -> legacy manual tasks
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "employees") {
    const employees = await getEmployees();
    return NextResponse.json({ success: true, employees, count: employees.length });
  }

  if (action === "manual-list") {
    const rows = await db.query(
      `SELECT * FROM tasks ORDER BY done ASC, due_date ASC NULLS LAST, CASE WHEN priority='high' THEN 1 WHEN priority='medium' THEN 2 ELSE 3 END`
    );
    return NextResponse.json({ success: true, tasks: rows, count: rows.length });
  }

  if (action === "list") {
    if (!(await ensureWorkerBookingTrackingColumns())) {
      return NextResponse.json({ success: true, requests: [], count: 0, message: "worker_bookings table is not available yet." });
    }

    const status = normalizeStatus(req.nextUrl.searchParams.get("status"));
    const rawStatus = req.nextUrl.searchParams.get("status") ?? "all";
    const employee = Number(req.nextUrl.searchParams.get("employee") ?? 0);
    const dateFrom = req.nextUrl.searchParams.get("date_from") ?? "";
    const dateTo = req.nextUrl.searchParams.get("date_to") ?? "";
    const sort = req.nextUrl.searchParams.get("sort") ?? "oldest-active";
    const where: string[] = [];
    const params: any[] = [];

    if (rawStatus !== "all") {
      if (status === "accepted") {
        where.push("wb.status IN ('accepted', 'confirmed', 'approved')");
      } else if (status === "done") {
        where.push("wb.status IN ('done', 'completed')");
      } else if (status === "declined") {
        where.push("wb.status IN ('declined', 'rejected')");
      } else {
        where.push("wb.status = ?");
        params.push(status);
      }
    }
    if (employee > 0) {
      where.push("wb.assigned_worker_id = ?");
      params.push(employee);
    }
    if (dateFrom) {
      where.push("wb.created_at::date >= ?::date");
      params.push(dateFrom);
    }
    if (dateTo) {
      where.push("wb.created_at::date <= ?::date");
      params.push(dateTo);
    }

    const orderBy =
      sort === "newest" ? "wb.created_at DESC" :
      sort === "status" ? "CASE WHEN wb.status = 'pending' THEN 1 WHEN wb.status IN ('accepted','confirmed','approved') THEN 2 WHEN wb.status = 'in_progress' THEN 3 WHEN wb.status IN ('done','completed') THEN 4 ELSE 5 END, wb.created_at ASC" :
      "CASE WHEN wb.status IN ('done','completed','declined','rejected') THEN 2 ELSE 1 END, wb.created_at ASC";

    const rows = await db.query(
      `SELECT wb.id, wb.client_name, wb.email, wb.contact_number, wb.position, wb.slots_needed,
              wb.job_date, wb.shift_start, wb.shift_end, wb.notes, wb.status, wb.created_at,
              wb.updated_at, wb.assigned_worker_id, wb.accepted_at, wb.in_progress_at,
              wb.done_at, wb.declined_at, wb.admin_notes, wb.worker_notes,
              u.first_name AS worker_first_name, u.last_name AS worker_last_name,
              w.position AS worker_position
       FROM worker_bookings wb
       LEFT JOIN workers w ON w.id = wb.assigned_worker_id
       LEFT JOIN users u ON u.id = w.user_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY ${orderBy}
       LIMIT 200`,
      params
    );

    const requests = rows.map((row: any) => ({
      ...row,
      ...trackingFor(row),
      assigned_employee:
        row.worker_first_name || row.worker_last_name
          ? `${row.worker_first_name ?? ""} ${row.worker_last_name ?? ""}`.trim()
          : null,
    }));

    return NextResponse.json({ success: true, requests, count: requests.length });
  }

  return NextResponse.json({ success: false, message: `Admin tasks endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/tasks
 *   ?action=update-request -> update workforce request assignment/status
 *   ?action=create/toggle/update/delete -> legacy manual task actions
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "update-request") {
    const id = Number(data.id ?? 0);
    const requestedStatus = String(data.status ?? "").toLowerCase();
    const status = normalizeStatus(requestedStatus);
    const assignedWorkerId = data.assigned_worker_id ? Number(data.assigned_worker_id) : null;
    const adminNotes = data.admin_notes !== undefined ? String(data.admin_notes ?? "").trim() : undefined;
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid request ID." }, { status: 400 });
    }
    if (!TRACKED_STATUSES.includes(requestedStatus as TrackedStatus)) {
      return NextResponse.json({ success: false, message: `Invalid status: ${data.status}` }, { status: 400 });
    }
    if (!(await ensureWorkerBookingTrackingColumns())) {
      return NextResponse.json({ success: false, message: "worker_bookings table is not available yet." }, { status: 404 });
    }
    const before = await db.queryOne<{ status: string }>("SELECT status FROM worker_bookings WHERE id = ? LIMIT 1", [id]);
    const previousStatus = normalizeStatus(before?.status);

    const fields = ["status = ?", "updated_at = NOW()"];
    const values: any[] = [status];
    if (data.assigned_worker_id !== undefined) {
      fields.push("assigned_worker_id = ?");
      values.push(assignedWorkerId);
    }
    if (adminNotes !== undefined) {
      fields.push("admin_notes = ?");
      values.push(adminNotes || null);
    }
    if (status === "accepted") fields.push("accepted_at = COALESCE(accepted_at, NOW())");
    if (status === "in_progress") {
      fields.push("accepted_at = COALESCE(accepted_at, NOW())");
      fields.push("in_progress_at = COALESCE(in_progress_at, NOW())");
    }
    if (status === "done") {
      fields.push("accepted_at = COALESCE(accepted_at, NOW())");
      fields.push("in_progress_at = COALESCE(in_progress_at, NOW())");
      fields.push("done_at = COALESCE(done_at, NOW())");
    }
    if (status === "declined") {
      fields.push("declined_at = COALESCE(declined_at, NOW())");
    }
    if (status === "pending") {
      fields.push("accepted_at = NULL");
      fields.push("in_progress_at = NULL");
      fields.push("done_at = NULL");
      fields.push("declined_at = NULL");
    }

    values.push(id);
    await db.execute(`UPDATE worker_bookings SET ${fields.join(", ")} WHERE id = ?`, values);
    if (status === "accepted" && previousStatus !== "accepted") {
      sendWorkerBookingAcceptedNotice(id).catch((e) => console.error("Workforce accepted email failed:", e));
    }
    return NextResponse.json({ success: true, message: "Workforce request updated." });
  }

  if (action === "create") {
    const task = String(data.task ?? "").trim();
    if (!task) {
      return NextResponse.json({ success: false, message: "Task description is required." }, { status: 400 });
    }
    const priority = PRIORITIES.includes(data.priority) ? data.priority : "medium";
    const dueDate = String(data.due_date ?? "").trim() || null;

    const result = await db.execute(
      `INSERT INTO tasks (task, due_date, priority, done) VALUES (?, ?, ?, 0)`,
      [task, dueDate, priority]
    );
    return NextResponse.json({ success: true, message: "Task created.", id: result.insertId });
  }

  if (action === "toggle") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid task ID." }, { status: 400 });
    }
    await db.execute("UPDATE tasks SET done = NOT done WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Task updated." });
  }

  if (action === "update") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid task ID." }, { status: 400 });
    }
    if (data.priority && !PRIORITIES.includes(data.priority)) {
      return NextResponse.json({ success: false, message: `Invalid priority: ${data.priority}` }, { status: 400 });
    }
    const fields: string[] = [];
    const values: any[] = [];
    const map: Record<string, any> = {
      task: data.task !== undefined ? String(data.task).trim() : undefined,
      due_date: data.due_date !== undefined ? String(data.due_date).trim() || null : undefined,
      priority: data.priority !== undefined ? data.priority : undefined,
    };
    for (const [key, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update." }, { status: 400 });
    }
    values.push(id);
    await db.execute(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
    return NextResponse.json({ success: true, message: "Task updated." });
  }

  if (action === "delete") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid task ID." }, { status: 400 });
    }
    await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Task deleted." });
  }

  return NextResponse.json({ success: false, message: `Admin tasks endpoint not found: ${action}` }, { status: 404 });
}
