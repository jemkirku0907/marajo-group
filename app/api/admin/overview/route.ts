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

async function countRows(table: string, where = "TRUE"): Promise<number> {
  if (!(await tableExists(table))) return 0;
  const row = await db.queryOne<{ c: number }>(`SELECT COUNT(*) c FROM ${table} WHERE ${where}`);
  return Number(row?.c ?? 0);
}

async function sumCounts(rows: Array<{ c?: number | string }>): Promise<number> {
  return rows.reduce((total, row) => total + Number(row.c ?? 0), 0);
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
    try {
    const hasInquiries = await tableExists("inquiries");
    const hasUnits = await tableExists("units");
    const hasProperties = await tableExists("properties");
    const hasAppointments = await tableExists("appointments");
    const hasTasks = await tableExists("tasks");
    const hasContacts = await tableExists("contacts");
    const hasUsers = await tableExists("users");
    const hasStaff = await tableExists("staff");
    const hasWorkers = await tableExists("workers");
    const hasWorkerBookings = await tableExists("worker_bookings");
    const hasCourtBookings = await tableExists("court_bookings");
    const hasParkingReservations = await tableExists("parking_reservations");
    const hasNotifications = await tableExists("notifications");
    const hasNews = await tableExists("news");
    const hasReviews = await tableExists("reviews");

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
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM tasks WHERE done = false"))?.c ?? 0
      : 0;
    const totalContacts = hasContacts
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM contacts"))?.c ?? 0
      : 0;
    const totalUsers = hasUsers ? await countRows("users") : 0;
    const activeUsers = hasUsers ? await countRows("users", "is_active = TRUE") : 0;
    const staffMembers = hasStaff ? await countRows("staff") : 0;
    const availableWorkers = hasWorkers ? await countRows("workers", "availability_status = 'available'") : 0;
    const totalWorkers = hasWorkers ? await countRows("workers") : 0;
    const newsArticles = hasNews ? await countRows("news") : 0;
    const reviews = hasReviews ? await countRows("reviews") : 0;
    const unreadNotifications = hasNotifications
      ? (await db.queryOne<{ c: number }>(
          "SELECT COUNT(*) c FROM notifications WHERE (staff_id = ? OR staff_id = 0) AND is_read = 0",
          [staff.staff_id]
        ))?.c ?? 0
      : 0;
    const activeBookings = await sumCounts([
      hasWorkerBookings
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status IN ('pending','approved','confirmed','assigned','in_progress')")) ?? { c: 0 })
        : { c: 0 },
      hasCourtBookings
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings WHERE booking_status NOT IN ('cancelled','completed')")) ?? { c: 0 })
        : { c: 0 },
      hasParkingReservations
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations WHERE reservation_status NOT IN ('cancelled','completed')")) ?? { c: 0 })
        : { c: 0 },
    ]);
    const pendingBookings = await sumCounts([
      hasWorkerBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status = 'pending'")) ?? { c: 0 }) : { c: 0 },
      hasCourtBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings WHERE booking_status = 'pending'")) ?? { c: 0 }) : { c: 0 },
      hasParkingReservations ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations WHERE reservation_status = 'pending'")) ?? { c: 0 }) : { c: 0 },
    ]);
    const completedBookings = await sumCounts([
      hasWorkerBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status = 'completed'")) ?? { c: 0 }) : { c: 0 },
      hasCourtBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings WHERE booking_status = 'completed'")) ?? { c: 0 }) : { c: 0 },
      hasParkingReservations ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations WHERE reservation_status = 'completed'")) ?? { c: 0 }) : { c: 0 },
    ]);
    const cancelledBookings = await sumCounts([
      hasWorkerBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE status IN ('cancelled','rejected')")) ?? { c: 0 }) : { c: 0 },
      hasCourtBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings WHERE booking_status = 'cancelled'")) ?? { c: 0 }) : { c: 0 },
      hasParkingReservations ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations WHERE reservation_status = 'cancelled'")) ?? { c: 0 }) : { c: 0 },
    ]);
    const occupiedUnits = hasUnits
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM units WHERE status IN ('occupied','reserved','sold')"))?.c ?? 0
      : 0;
    const totalBookings = await sumCounts([
      hasWorkerBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings")) ?? { c: 0 }) : { c: 0 },
      hasCourtBookings ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings")) ?? { c: 0 }) : { c: 0 },
      hasParkingReservations ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations")) ?? { c: 0 }) : { c: 0 },
    ]);
    const currentMonthInquiries = hasInquiries
      ? (await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM inquiries WHERE created_at >= date_trunc('month', CURRENT_DATE)"))?.c ?? 0
      : 0;
    const previousMonthInquiries = hasInquiries
      ? (await db.queryOne<{ c: number }>(
          "SELECT COUNT(*) c FROM inquiries WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < date_trunc('month', CURRENT_DATE)"
        ))?.c ?? 0
      : 0;
    const currentMonthBookings = await sumCounts([
      hasWorkerBookings
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM worker_bookings WHERE created_at >= date_trunc('month', CURRENT_DATE)")) ?? { c: 0 })
        : { c: 0 },
      hasCourtBookings
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM court_bookings WHERE created_at >= date_trunc('month', CURRENT_DATE)")) ?? { c: 0 })
        : { c: 0 },
      hasParkingReservations
        ? ((await db.queryOne<{ c: number }>("SELECT COUNT(*) c FROM parking_reservations WHERE created_at >= date_trunc('month', CURRENT_DATE)")) ?? { c: 0 })
        : { c: 0 },
    ]);
    const previousMonthBookings = await sumCounts([
      hasWorkerBookings
        ? ((await db.queryOne<{ c: number }>(
            "SELECT COUNT(*) c FROM worker_bookings WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < date_trunc('month', CURRENT_DATE)"
          )) ?? { c: 0 })
        : { c: 0 },
      hasCourtBookings
        ? ((await db.queryOne<{ c: number }>(
            "SELECT COUNT(*) c FROM court_bookings WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < date_trunc('month', CURRENT_DATE)"
          )) ?? { c: 0 })
        : { c: 0 },
      hasParkingReservations
        ? ((await db.queryOne<{ c: number }>(
            "SELECT COUNT(*) c FROM parking_reservations WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < date_trunc('month', CURRENT_DATE)"
          )) ?? { c: 0 })
        : { c: 0 },
    ]);
    const appointmentsThisWeek = hasAppointments
      ? (await db.queryOne<{ c: number }>(
          "SELECT COUNT(*) c FROM appointments WHERE status = 'upcoming' AND appt_date >= CURRENT_DATE AND appt_date < CURRENT_DATE + INTERVAL '7 days'"
        ))?.c ?? 0
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
           WHERE done = false ORDER BY due_date ASC LIMIT 5`
        )
      : [];

    const recentUsers = hasUsers
      ? await db.query(
          `SELECT id, email, first_name, last_name, created_at
           FROM users ORDER BY created_at DESC LIMIT 5`
        )
      : [];

    const recentContacts = hasContacts
      ? await db.query(
          `SELECT id, name, email, property_interest, unit_interest, last_inquiry_at, created_at
           FROM contacts ORDER BY last_inquiry_at DESC NULLS LAST, created_at DESC LIMIT 5`
        )
      : [];

    const workerBookings = hasWorkerBookings
      ? await db.query(
          `SELECT id, client_name AS customer_name, position AS property_name, NULL::text AS worker_name,
                  job_date::text AS booking_date, status, created_at, 'Workforce' AS source
           FROM worker_bookings ORDER BY created_at DESC LIMIT 5`
        )
      : [];
    const courtBookings = hasCourtBookings
      ? await db.query(
          `SELECT id, full_name AS customer_name, 'Court Booking' AS property_name, NULL::text AS worker_name,
                  booking_date::text AS booking_date, booking_status AS status, created_at, 'Court' AS source
           FROM court_bookings ORDER BY created_at DESC LIMIT 5`
        )
      : [];
    const parkingBookings = hasParkingReservations
      ? await db.query(
          `SELECT id, full_name AS customer_name, 'Parking' AS property_name, NULL::text AS worker_name,
                  reservation_date::text AS booking_date, reservation_status AS status, created_at, 'Parking' AS source
           FROM parking_reservations ORDER BY created_at DESC LIMIT 5`
        )
      : [];
    const recentBookings = [...workerBookings, ...courtBookings, ...parkingBookings]
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 6);

    const workerStatus = hasWorkers
      ? await db.query("SELECT availability_status AS status, COUNT(*) c FROM workers GROUP BY availability_status ORDER BY availability_status")
      : [];
    const propertyStatus = hasUnits
      ? await db.query("SELECT status, COUNT(*) c FROM units GROUP BY status ORDER BY status")
      : [];
    const recentNotifications = hasNotifications
      ? await db.query(
          `SELECT id, title, message, is_read, created_at FROM notifications
           WHERE staff_id = ? OR staff_id = 0
           ORDER BY created_at DESC LIMIT 5`,
          [staff.staff_id]
        )
      : [];

    const monthlyInquiries = hasInquiries
      ? await db.query(
          `SELECT to_char(date_trunc('month', created_at), 'Mon') label, COUNT(*) c
           FROM inquiries WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
           GROUP BY date_trunc('month', created_at)
           ORDER BY date_trunc('month', created_at)`
        )
      : [];
    const monthlyUsers = hasUsers
      ? await db.query(
          `SELECT to_char(date_trunc('month', created_at), 'Mon') label, COUNT(*) c
           FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
           GROUP BY date_trunc('month', created_at)
           ORDER BY date_trunc('month', created_at)`
        )
      : [];
    const monthlyBookings = hasWorkerBookings
      ? await db.query(
          `SELECT to_char(date_trunc('month', created_at), 'Mon') label, COUNT(*) c
           FROM worker_bookings WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
           GROUP BY date_trunc('month', created_at)
           ORDER BY date_trunc('month', created_at)`
        )
      : [];
    const leadActivity = hasInquiries
      ? await db.query(
          `SELECT to_char(created_at::date, 'Mon DD') label, COUNT(*) c
           FROM inquiries
           WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
           GROUP BY created_at::date
           ORDER BY created_at::date`
        )
      : [];
    const topProperties = hasInquiries
      ? await db.query(
          `SELECT COALESCE(NULLIF(project, ''), NULLIF(unit_name, ''), 'General Inquiry') name, COUNT(*) c
           FROM inquiries
           GROUP BY COALESCE(NULLIF(project, ''), NULLIF(unit_name, ''), 'General Inquiry')
           ORDER BY COUNT(*) DESC, name ASC
           LIMIT 5`
        )
      : [];

    const activity = [
      ...recentInquiries.map((item: any) => ({
        type: "Lead",
        title: "New inquiry received",
        detail: `${item.name} - ${item.project || item.unit_name || "Property inquiry"}`,
        created_at: item.created_at,
      })),
      ...recentBookings.map((item: any) => ({
        type: item.source,
        title: "Booking activity",
        detail: `${item.customer_name} - ${item.status}`,
        created_at: item.created_at,
      })),
      ...recentContacts.map((item: any) => ({
        type: "Contact",
        title: "Contact updated",
        detail: `${item.name} - ${item.property_interest || item.email || "Inquiry"}`,
        created_at: item.last_inquiry_at || item.created_at,
      })),
    ]
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      stats: {
        total_users: Number(totalUsers),
        active_users: Number(activeUsers),
        staff_members: Number(staffMembers),
        total_workers: Number(totalWorkers),
        available_workers: Number(availableWorkers),
        active_bookings: Number(activeBookings),
        total_bookings: Number(totalBookings),
        pending_bookings: Number(pendingBookings),
        completed_bookings: Number(completedBookings),
        cancelled_bookings: Number(cancelledBookings),
        total_inquiries: Number(totalInquiries),
        new_inquiries: Number(newInquiries),
        converted_inquiries: Number(convertedInquiries),
        total_units: Number(totalUnits),
        available_units: Number(availableUnits),
        occupied_units: Number(occupiedUnits),
        total_properties: Number(totalProperties),
        upcoming_appointments: Number(upcomingAppointments),
        appointments_this_week: Number(appointmentsThisWeek),
        pending_tasks: Number(pendingTasks),
        total_contacts: Number(totalContacts),
        news_articles: Number(newsArticles),
        reviews: Number(reviews),
        unread_notifications: Number(unreadNotifications),
      },
      trends: {
        current_month_inquiries: Number(currentMonthInquiries),
        previous_month_inquiries: Number(previousMonthInquiries),
        current_month_bookings: Number(currentMonthBookings),
        previous_month_bookings: Number(previousMonthBookings),
      },
      recent_inquiries: recentInquiries,
      upcoming_appointments: upcomingAppointmentsList,
      upcoming_tasks: upcomingTasks,
      recent_bookings: recentBookings,
      recent_users: recentUsers,
      recent_contacts: recentContacts,
      worker_status: workerStatus,
      property_status: propertyStatus,
      notifications: recentNotifications,
      charts: {
        monthly_inquiries: monthlyInquiries,
        monthly_users: monthlyUsers,
        monthly_bookings: monthlyBookings,
        lead_activity: leadActivity,
      },
      top_properties: topProperties,
      activity,
    });
    } catch (error) {
      console.error("[admin overview] summary failed", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to load admin overview.",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: false, message: `Admin overview endpoint not found: ${action}` }, { status: 404 });
}
