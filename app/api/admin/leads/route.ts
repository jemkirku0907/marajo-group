import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { sendInquiryAcceptedNotice } from "@/lib/mail";
import { noStoreHeaders, readJsonBody, RequestBodyError } from "@/lib/security";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

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

const ACTIVITY_TYPES = ["note", "call", "visit_scheduled", "transfer"];

function fmtDate(d: any): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * GET /api/admin/leads
 *   ?action=list                -> all inquiries (mirrors dashboard.php "All inquiries" query)
 *   ?action=timeline&inquiry_id= -> lead detail + activity timeline + agent list (mirrors get_lead_timeline.php)
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT i.id, i.name, i.email, i.phone, i.project, i.unit_name, i.message,
              i.status, i.assigned_staff_id, i.created_at, s.name AS staff_name
       FROM inquiries i
       LEFT JOIN staff s ON i.assigned_staff_id = s.id
       ORDER BY i.created_at DESC`
    );
    return NextResponse.json(
      { success: true, leads: rows, count: rows.length, statuses: STATUS_OPTIONS },
      { headers: noStoreHeaders },
    );
  }

  if (action === "timeline") {
    const inquiryId = Number(req.nextUrl.searchParams.get("inquiry_id") ?? 0);
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: "Invalid lead ID." }, { status: 400 });
    }

    const lead = await db.queryOne(
      `SELECT i.id, i.name, i.email, i.phone, i.project, i.unit_name, i.unit_type,
              i.message, i.status, i.visit_date, i.visit_time, i.created_at,
              i.assigned_staff_id, s.name AS agent_name, s.role AS agent_role
       FROM inquiries i
       LEFT JOIN staff s ON i.assigned_staff_id = s.id
       WHERE i.id = ? LIMIT 1`,
      [inquiryId]
    );
    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found." }, { status: 404 });
    }

    const activityRows = await db.query<any>(
      `SELECT a.*, s.name AS staff_name
       FROM inquiry_activity a
       LEFT JOIN staff s ON a.staff_id = s.id
       WHERE a.inquiry_id = ?
       ORDER BY a.created_at DESC`,
      [inquiryId]
    );
    const timeline = activityRows.map((row) => ({
      id: Number(row.id),
      staff_id: row.staff_id ? Number(row.staff_id) : null,
      staff_name: row.staff_name ?? "System",
      activity_type: row.activity_type,
      details: row.details,
      created_at: fmtDate(row.created_at),
      timestamp: row.created_at,
    }));

    const agents = await db.query(
      "SELECT id, name, role FROM staff WHERE is_active = 1 AND role_code IN ('super_admin', 'admin', 'property_manager') ORDER BY name ASC"
    );

    return NextResponse.json({ success: true, lead, timeline, agents }, { headers: noStoreHeaders });
  }

  return NextResponse.json({ success: false, message: `Admin leads endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/leads
 *   ?action=update-status -> mirrors update_inquiry_status.php
 *   ?action=log-activity  -> mirrors log_lead_activity.php (note, call, visit_scheduled, transfer)
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  let data: Record<string, any>;
  try {
    data = await readJsonBody<Record<string, any>>(req, 16_384);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status });
  }

  if (action === "update-status") {
    const id = Number(data.id ?? 0);
    const status = String(data.status ?? "").trim();
    const note = String(data.note ?? "").trim();
    if (note.length > 2_000) {
      return NextResponse.json({ success: false, message: "Note is too long." }, { status: 400 });
    }

    if (!id || !STATUS_OPTIONS.includes(status)) {
      return NextResponse.json({ success: false, message: `Invalid inquiry status update. Status: ${status}` }, { status: 400 });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [beforeRows]: any = await conn.execute("SELECT status FROM inquiries WHERE id = ? LIMIT 1", [id]);
      const previousStatus = String(beforeRows[0]?.status ?? "");

      await conn.execute("UPDATE inquiries SET status = ? WHERE id = ?", [status, id]);

      const staffId = staff.staff_id;

      if (note !== "") {
        await conn.execute("INSERT INTO inquiry_notes (inquiry_id, staff_id, note) VALUES (?, ?, ?)", [id, staffId, note]);
      }

      let actDetails = `Status changed to: ${status}`;
      if (note !== "") actDetails += `. Follow-up Note: ${note}`;

      await conn.execute(
        `INSERT INTO inquiry_activity (inquiry_id, staff_id, activity_type, details) VALUES (?, ?, 'status_change', ?)`,
        [id, staffId, actDetails]
      );

      const message = `Inquiry #${id} status updated to ${status}.`;
      await conn.execute(
        "INSERT INTO notifications (staff_id, title, message, is_read) VALUES (0, ?, ?, 0)",
        ["Lead Status Updated", message]
      );

      await conn.commit();
      conn.release();
      if (["Qualified", "Site Visit Scheduled", "Reserved", "Closed Sale"].includes(status) && previousStatus !== status) {
        sendInquiryAcceptedNotice(id).catch((e) => console.error("Inquiry accepted email failed:", e));
      }
      return NextResponse.json({ success: true, message: "Status updated." });
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      console.error("Unable to update inquiry status.", { inquiryId: id, code: e?.code });
      return NextResponse.json({ success: false, message: "Unable to update status." }, { status: 500 });
    }
  }

  if (action === "log-activity") {
    const inquiryId = Number(data.inquiry_id ?? 0);
    const activityType = String(data.activity_type ?? "").trim();

    if (!inquiryId || !ACTIVITY_TYPES.includes(activityType)) {
      return NextResponse.json({ success: false, message: "Invalid request parameters." }, { status: 400 });
    }

    const staffId = staff.staff_id;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [inquiryRows]: any = await conn.execute(
        "SELECT id, contact_id, name, project, unit_name FROM inquiries WHERE id = ? LIMIT 1",
        [inquiryId]
      );
      const inquiry = inquiryRows[0];
      if (!inquiry) throw new Error("Lead not found.");

      const contactId = Number(inquiry.contact_id);
      const clientName = inquiry.name;
      const property = inquiry.project;
      const unit = inquiry.unit_name;

      let details = String(data.details ?? "").trim();
      if (details.length > 2_000) throw new Error("Activity details are too long.");

      if (activityType === "transfer") {
        const targetStaffId = Number(data.target_staff_id ?? 0);
        if (!targetStaffId) throw new Error("Invalid agent selected for transfer.");

        const [targetRows]: any = await conn.execute("SELECT name FROM staff WHERE id = ? LIMIT 1", [targetStaffId]);
        const targetStaff = targetRows[0];
        if (!targetStaff) throw new Error("Target agent not found.");

        const [currentRows]: any = await conn.execute("SELECT name FROM staff WHERE id = ? LIMIT 1", [staffId]);
        const currentStaffName = currentRows[0]?.name ?? "System";

        await conn.execute("UPDATE inquiries SET assigned_staff_id = ? WHERE id = ?", [targetStaffId, inquiryId]);

        details = `Lead transferred from ${currentStaffName} to ${targetStaff.name}.`;
      } else if (activityType === "visit_scheduled") {
        const visitDate = String(data.visit_date ?? "").trim();
        const visitTime = String(data.visit_time ?? "").trim();
        if (!visitDate || !visitTime) throw new Error("Site visit date and time are required.");

        const status = "Site Visit Scheduled";
        await conn.execute("UPDATE inquiries SET visit_date = ?, visit_time = ?, status = ? WHERE id = ?", [
          visitDate,
          visitTime,
          status,
          inquiryId,
        ]);

        const apptTitle = `Site Viewing — ${property || "Property"}`;
        const apptNotes = `${details}\n\nLog reference: visit_scheduled`.trim();
        await conn.execute(
          `INSERT INTO appointments
            (inquiry_id, contact_id, title, client_name, property_name, unit_name, notes, appt_date, appt_time, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
          [inquiryId, contactId, apptTitle, clientName, property, unit, apptNotes, visitDate, visitTime]
        );

        const visitDateFmt = new Date(visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const visitTimeFmt = new Date(`1970-01-01T${visitTime}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        details = `Site visit scheduled for ${visitDateFmt} at ${visitTimeFmt}. Notes: ${details}`;
      }

      await conn.execute(
        "INSERT INTO inquiry_activity (inquiry_id, staff_id, activity_type, details) VALUES (?, ?, ?, ?)",
        [inquiryId, staffId, activityType, details]
      );

      await conn.commit();
      conn.release();
      return NextResponse.json({ success: true, message: "Activity logged successfully." });
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      console.error("Unable to log inquiry activity.", { inquiryId, code: e?.code });
      return NextResponse.json({ success: false, message: "Failed to log activity." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: `Admin leads endpoint not found: ${action}` }, { status: 404 });
}
