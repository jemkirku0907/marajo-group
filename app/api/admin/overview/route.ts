import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?", [table]);
  return rows.length > 0;
}

/**
 * GET /api/admin/overview
 *   ?action=summary -> dashboard stat cards + recent inquiries + recent appointments + tasks snapshot
 * Mirrors the "dashboard" section of dashboard.php
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "summary";

  if (action === "summary") {
    const hasInquiries = await tableExists("inquiries");
    const hasUnits = await tableExists("units");
    const hasProperties = await tableExists("properties");
    const hasAppointments = await tableExists("appointments");
    const hasTasks = await tableExists("tasks");
    const hasContacts = await tableExists("contacts");

    const totalInquiries = hasInquiries
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM inquiries"))?.c ?? 0
      : 0;
    const newInquiries = hasInquiries
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM inquiries WHERE status = 'New'"))?.c ?? 0
      : 0;
    const convertedInquiries = hasInquiries
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM inquiries WHERE status = 'Converted'"))?.c ?? 0
      : 0;
    const totalUnits = hasUnits ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM units"))?.c ?? 0 : 0;
    const availableUnits = hasUnits
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM units WHERE status = 'available'"))?.c ?? 0
      : 0;
    const totalProperties = hasProperties
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM properties"))?.c ?? 0
      : 0;
    const upcomingAppointments = hasAppointments
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM appointments WHERE status = 'upcoming'"))?.c ?? 0
      : 0;
    const pendingTasks = hasTasks
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM tasks WHERE done = 0"))?.c ?? 0
      : 0;
    const totalContacts = hasContacts
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM contacts"))?.c ?? 0
      : 0;

    const recentInquiries = hasInquiries
      ? await db.query(
          `SELECT id, name, project, unit_name, status, lead_source, created_at
           FROM inquiries ORDER BY created_at DESC LIMIT 5`
        )
      : [];

    const upcomingAppointmentsList = hasAppointments
      ? await db.query(
          `SELECT id, title, client_name, property_name, unit_name, appt_date, appt_time, status
           FROM appointments WHERE status = 'upcoming'
           ORDER BY appt_date ASC, appt_time ASC LIMIT 5`
        )
      : [];

    const upcomingTasks = hasTasks
      ? await db.query(
          `SELECT id, task, due_date, priority, done FROM tasks
           WHERE done = 0 ORDER BY due_date ASC LIMIT 5`
        )
      : [];

    return NextResponse.json({
      success: true,
      stats: {
        total_inquiries: Number(totalInquiries),
        new_inquiries: Number(newInquiries),
        converted_inquiries: Number(convertedInquiries),
        total_units: Number(totalUnits),
        available_units: Number(availableUnits),
        total_properties: Number(totalProperties),
        upcoming_appointments: Number(upcomingAppointments),
        pending_tasks: Number(pendingTasks),
        total_contacts: Number(totalContacts),
      },
      recent_inquiries: recentInquiries,
      upcoming_appointments: upcomingAppointmentsList,
      upcoming_tasks: upcomingTasks,
    });
  }

  return NextResponse.json({ success: false, message: `Admin overview endpoint not found: ${action}` }, { status: 404 });
}
