import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

const PRIORITIES = ["high", "medium", "low"];

/**
 * GET /api/admin/tasks
 *   ?action=list -> all tasks
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT * FROM tasks ORDER BY done ASC, due_date ASC NULLS LAST, CASE WHEN priority='high' THEN 1 WHEN priority='medium' THEN 2 ELSE 3 END`
    );
    return NextResponse.json({ success: true, tasks: rows, count: rows.length });
  }

  return NextResponse.json({ success: false, message: `Admin tasks endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/tasks
 *   ?action=create -> insert new task
 *   ?action=toggle -> flip done state
 *   ?action=update -> update task fields
 *   ?action=delete -> remove task
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

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
