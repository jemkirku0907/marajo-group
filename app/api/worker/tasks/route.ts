import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const WORKER_VISIBLE_STATUSES = ["accepted", "confirmed", "approved", "in_progress", "done", "completed", "declined"];
const WORKER_UPDATE_STATUSES = ["in_progress", "done", "declined"] as const;
type WorkerUpdateStatus = (typeof WORKER_UPDATE_STATUSES)[number];

function unauthorized(message = "You must be logged in as a worker.") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

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

async function ensureTrackingColumns() {
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

async function getWorkerForUser(userId: number) {
  if (!(await tableExists("workers"))) return null;
  return db.queryOne<any>(
    `SELECT w.id, w.position, w.availability_status, w.verification_status,
            u.first_name, u.last_name, u.email
     FROM workers w
     JOIN users u ON u.id = w.user_id
     WHERE w.user_id = ?
     LIMIT 1`,
    [userId]
  );
}

function normalizeStatus(status: string | null | undefined) {
  const value = String(status ?? "pending").toLowerCase();
  if (value === "confirmed" || value === "approved" || value === "accepted") return "accepted";
  if (value === "completed" || value === "done") return "done";
  if (value === "declined" || value === "rejected") return "declined";
  if (value === "in_progress") return "in_progress";
  return "pending";
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

function mapAssignment(row: any) {
  const status = normalizeStatus(row.status);
  const currentSince =
    status === "accepted" ? row.accepted_at || row.updated_at || row.created_at :
    status === "in_progress" ? row.in_progress_at || row.accepted_at || row.created_at :
    status === "declined" ? row.declined_at || row.updated_at || row.created_at :
    row.done_at || row.in_progress_at || row.accepted_at || row.created_at;

  return {
    ...row,
    status,
    status_label:
      status === "in_progress" ? "In Progress" :
      status === "done" ? "Done" :
      status === "declined" ? "Declined" :
      "Accepted",
    current_status_age: durationLabel(
      currentSince,
      status === "done" ? row.done_at : status === "declined" ? row.declined_at : null
    ),
    total_elapsed: durationLabel(row.created_at, status === "declined" ? row.declined_at : row.done_at),
  };
}

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) return unauthorized();
  if (user.role !== "worker") return unauthorized("This view is only available to workforce employees.");

  const worker = await getWorkerForUser(user.user_id);
  if (!worker) {
    return NextResponse.json({ success: false, message: "No worker profile is linked to this account." }, { status: 403 });
  }
  if (!(await ensureTrackingColumns())) {
    return NextResponse.json({ success: true, worker, active: [], completed: [], count: 0 });
  }

  const rows = await db.query<any>(
    `SELECT id, client_name, contact_number, email, position, slots_needed, job_date,
            shift_start, shift_end, notes, status, created_at, updated_at, accepted_at,
            in_progress_at, done_at, declined_at, admin_notes, worker_notes
     FROM worker_bookings
     WHERE assigned_worker_id = ?
       AND status = ANY(?::text[])
     ORDER BY COALESCE(done_at, in_progress_at, accepted_at, updated_at, created_at) DESC
     LIMIT 100`,
    [worker.id, WORKER_VISIBLE_STATUSES]
  );

  const mapped = rows.map(mapAssignment);
  return NextResponse.json({
    success: true,
    worker,
    active: mapped.filter((row) => row.status !== "done" && row.status !== "declined"),
    completed: mapped.filter((row) => row.status === "done" || row.status === "declined"),
    count: mapped.length,
  });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) return unauthorized();
  if (user.role !== "worker") return unauthorized("Only workforce employees can update assigned jobs.");

  const worker = await getWorkerForUser(user.user_id);
  if (!worker) {
    return NextResponse.json({ success: false, message: "No worker profile is linked to this account." }, { status: 403 });
  }
  if (!(await ensureTrackingColumns())) {
    return NextResponse.json({ success: false, message: "Workforce bookings table is not available yet." }, { status: 404 });
  }

  const data = await req.json().catch(() => ({}));
  const id = Number(data.id ?? 0);
  const status = String(data.status ?? "").toLowerCase() as WorkerUpdateStatus;
  const workerNote = data.worker_note !== undefined ? String(data.worker_note ?? "").trim() : undefined;
  if (!id || !WORKER_UPDATE_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: "A valid assignment id and status are required." }, { status: 400 });
  }

  const assignment = await db.queryOne<any>(
    "SELECT id, status FROM worker_bookings WHERE id = ? AND assigned_worker_id = ? LIMIT 1",
    [id, worker.id]
  );
  if (!assignment) {
    return NextResponse.json({ success: false, message: "Assignment not found for this worker." }, { status: 404 });
  }

  const currentStatus = normalizeStatus(assignment.status);
  if (status === "in_progress" && currentStatus !== "accepted") {
    return NextResponse.json({ success: false, message: "Only accepted jobs can be started." }, { status: 400 });
  }
  if (status === "done" && currentStatus !== "in_progress") {
    return NextResponse.json({ success: false, message: "Only in-progress jobs can be marked done." }, { status: 400 });
  }
  if (status === "declined" && currentStatus !== "accepted") {
    return NextResponse.json({ success: false, message: "Only accepted jobs can be declined before starting." }, { status: 400 });
  }

  if (status === "in_progress") {
    await db.execute(
      `UPDATE worker_bookings
       SET status = 'in_progress',
           accepted_at = COALESCE(accepted_at, NOW()),
           in_progress_at = COALESCE(in_progress_at, NOW()),
           worker_notes = COALESCE(?, worker_notes),
           updated_at = NOW()
       WHERE id = ? AND assigned_worker_id = ?`,
      [workerNote ?? null, id, worker.id]
    );
    await db.execute("UPDATE workers SET availability_status = 'on_job' WHERE id = ?", [worker.id]);
  } else if (status === "done") {
    await db.execute(
      `UPDATE worker_bookings
       SET status = 'done',
           accepted_at = COALESCE(accepted_at, NOW()),
           in_progress_at = COALESCE(in_progress_at, NOW()),
           done_at = COALESCE(done_at, NOW()),
           worker_notes = COALESCE(?, worker_notes),
           updated_at = NOW()
       WHERE id = ? AND assigned_worker_id = ?`,
      [workerNote ?? null, id, worker.id]
    );
    await db.execute(
      `UPDATE workers
       SET availability_status = CASE
         WHEN EXISTS (
           SELECT 1 FROM worker_bookings
           WHERE assigned_worker_id = ? AND status = 'in_progress' AND id <> ?
         ) THEN 'on_job'
         ELSE 'available'
       END
       WHERE id = ?`,
      [worker.id, id, worker.id]
    );
  } else {
    await db.execute(
      `UPDATE worker_bookings
       SET status = 'declined',
           declined_at = COALESCE(declined_at, NOW()),
           worker_notes = COALESCE(?, worker_notes),
           updated_at = NOW()
       WHERE id = ? AND assigned_worker_id = ?`,
      [workerNote ?? null, id, worker.id]
    );
    await db.execute("UPDATE workers SET availability_status = 'available' WHERE id = ?", [worker.id]);
  }

  return NextResponse.json({ success: true, message: "Assignment updated." });
}
