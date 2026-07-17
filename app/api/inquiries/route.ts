import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireActiveTenant } from "@/lib/tenantMembership";
import { turnstileEnabled, turnstileSiteKey, verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/rateLimit";

const CONTACT_TO = "admin@marajogroup.com";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("action") === "turnstile-site-key") {
    return NextResponse.json({
      success: true,
      turnstile_enabled: turnstileEnabled(),
      site_key: turnstileSiteKey(),
    });
  }
  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}

function val(data: Record<string, any>, keys: string[], def = ""): string {
  for (const k of keys) {
    if (data[k] !== undefined && String(data[k]).trim() !== "") return String(data[k]).trim();
  }
  return def;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createContactTransport() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return null;
}

function logInquiryError(stage: string, error: any, context: Record<string, any> = {}) {
  console.error("Inquiry submission error:", {
    stage,
    message: error?.message,
    code: error?.code,
    errno: error?.errno,
    sqlState: error?.sqlState,
    sqlMessage: error?.sqlMessage,
    stack: error?.stack,
    ...context,
  });
}

async function findAssignableStaffId(conn: any): Promise<number | null> {
  try {
    const [rows]: any = await conn.execute(
      "SELECT id FROM staff WHERE role_code IN ('admin', 'property_manager', 'staff', 'super_admin') AND is_active = 1 ORDER BY id ASC LIMIT 1"
    );
    if (rows[0]?.id) return Number(rows[0].id);
  } catch (error) {
    logInquiryError("staff_lookup", error);
  }

  try {
    const [rows]: any = await conn.execute("SELECT id FROM staff WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
    if (rows[0]?.id) return Number(rows[0].id);
  } catch (error) {
    logInquiryError("staff_fallback_lookup", error);
  }

  return null;
}

async function runOptionalTransactionStep(
  conn: any,
  stage: string,
  work: () => Promise<void>,
  context: Record<string, any> = {}
) {
  const savepoint = `optional_${stage.replace(/[^a-z0-9_]/gi, "_")}`;
  await conn.query(`SAVEPOINT ${savepoint}`);
  try {
    await work();
    await conn.query(`RELEASE SAVEPOINT ${savepoint}`);
  } catch (error) {
    await conn.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    await conn.query(`RELEASE SAVEPOINT ${savepoint}`);
    logInquiryError(stage, error, context);
  }
}

async function sendContactEmail(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  project: string;
  unitName: string;
  sourcePageUrl: string;
}) {
  const transport = createContactTransport();
  if (!transport) {
    console.log(`[mail:disabled] Contact inquiry for ${CONTACT_TO}: ${input.subject}`);
    return false;
  }
  const submittedAt = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
  const rows = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone Number", input.phone],
    ["Subject", input.subject],
    ["Project", input.project || "N/A"],
    ["Unit", input.unitName || "N/A"],
    ["Date & Time", submittedAt],
    ["Source Page", input.sourcePageUrl || "Website"],
  ];
  const htmlRows = rows
    .map(([label, value]) => `<tr><td style="padding:8px 12px;color:#64748b;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(value)}</strong></td></tr>`)
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
    <div style="max-width:640px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#1f6e34;color:#fff;padding:22px 26px"><h1 style="font-size:20px;margin:0">New Marajo Website Inquiry</h1><p style="margin:6px 0 0;color:#dcfce7">Contact form submission</p></div>
      <table style="width:100%;border-collapse:collapse">${htmlRows}</table>
      <div style="padding:20px 26px"><h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#64748b">Message</h2><p style="line-height:1.7;white-space:pre-wrap">${escapeHtml(input.message)}</p></div>
      <div style="padding:16px 26px;background:#f8fafc;color:#64748b;font-size:12px">Reply directly to ${escapeHtml(input.email)} or call ${escapeHtml(input.phone)}.</div>
    </div>
  </body></html>`;

  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.EMAIL_USER || "Marajo Group <no-reply@marajogroup.com>",
    to: CONTACT_TO,
    replyTo: input.email || CONTACT_TO,
    subject: `Marajo Inquiry: ${input.subject}`,
    html,
  });
  return true;
}

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => ({}));

  const name = val(data, ["name", "customer_name"]);
  const email = val(data, ["email", "customer_email"]);
  const phone = val(data, ["phone", "mobile", "mobile_number", "customer_phone"]);
  const propertyIdRaw = val(data, ["property_id"]);
  const propertyIdFromInput = /^\d+$/.test(propertyIdRaw) ? Number(propertyIdRaw) : null;
  const property = val(data, ["property_name", "project", "property"]);
  const unitName = val(data, ["unit_name", "unit"]);
  const unitType = val(data, ["unit_type", "type"]);
  const building = val(data, ["building"], property);
  const subjectLine = val(data, ["subject"], property ? `${property} inquiry` : "Website inquiry");
  const message = val(data, ["message"], "Website inquiry.");
  const sourcePageUrl = val(data, ["source_page_url", "source_url"], req.headers.get("referer") || "");
  const leadSource = val(data, ["lead_source"], "Website");
  const action = val(data, ["action", "inquiry_type"]).toLowerCase();
  const inquiryContext = val(data, ["inquiry_context"]).toLowerCase();

  if (inquiryContext === "contact") {
    const verified = await verifyTurnstileToken(data.turnstile_token, getClientIp(req));
    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Please complete the security check before sending your inquiry." },
        { status: 400 },
      );
    }
  }

  if (leadSource === "Facilities Booking") {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Please log in before submitting a facility request." }, { status: 401 });
    }
    const tenant = await requireActiveTenant(user.user_id);
    if (!tenant.ok) {
      return NextResponse.json({ success: false, message: tenant.message, membership_status: tenant.status }, { status: 403 });
    }
  }

  const prefContact = val(data, ["preferred_contact_method", "contact_method"]);
  const budgetRange = val(data, ["budget_range", "budget"]);
  const prefPayment = val(data, ["preferred_payment_method", "payment_method"]);
  const intendedPurpose = val(data, ["intended_purpose", "purpose"]);
  const purchaseTimeline = val(data, ["purchase_timeline", "timeline"]);

  let appointmentDate = val(data, ["appointment_date", "appt_date", "visit_date"]);
  let appointmentTime = val(data, ["appointment_time", "appt_time", "visit_time"]);

  const viewsCountRaw = val(data, ["views_count"]);
  let viewsCount = /^\d+$/.test(viewsCountRaw) ? Number(viewsCountRaw) : 1;
  if (viewsCount < 1) viewsCount = 1;

  const returnVisitsRaw = val(data, ["return_visits_count", "return_visits"]);
  const returnVisitsCount = /^\d+$/.test(returnVisitsRaw) ? Number(returnVisitsRaw) : 0;

  if (!name) {
    return NextResponse.json({ success: false, message: "Full name is required." }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ success: false, message: "Please provide an email address or mobile number." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
  }
  if (data.subject !== undefined && !subjectLine) {
    return NextResponse.json({ success: false, message: "Subject is required." }, { status: 400 });
  }
  if (data.message !== undefined && !message) {
    return NextResponse.json({ success: false, message: "Message is required." }, { status: 400 });
  }

  const isAppointment = /view|visit|tour|appointment|schedule|book/.test(action) || appointmentDate !== "";
  if (isAppointment && !appointmentDate) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    appointmentDate = d.toISOString().slice(0, 10);
  }
  if (isAppointment && !appointmentTime) appointmentTime = "10:00:00";
  if (appointmentTime && appointmentTime.length === 5) appointmentTime += ":00";

  // Lead scoring (0-100)
  const budgetPoints = budgetRange ? 20 : 0;
  const timelinePoints =
    { Immediately: 25, "Within 1 Month": 20, "Within 3 Months": 15, "Within 6 Months": 10, "Just Exploring": 5 }[
      purchaseTimeline
    ] || 0;
  const visitPoints = appointmentDate && appointmentDate !== "0000-00-00" ? 20 : 0;
  const viewsPoints = Math.min(10, viewsCount * 2);
  const returnsPoints = Math.min(15, returnVisitsCount * 5);
  let completionPoints = 0;
  if (prefContact) completionPoints += 3;
  if (intendedPurpose) completionPoints += 3;
  if (message && message.trim().length > 10) completionPoints += 4;
  const leadScore = budgetPoints + timelinePoints + visitPoints + viewsPoints + returnsPoints + completionPoints;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let propertyId = propertyIdFromInput;
    if (propertyId === null && property) {
      const [rows]: any = await conn.execute("SELECT id FROM properties WHERE name = ? LIMIT 1", [property]);
      if (rows[0]) propertyId = rows[0].id;
    }

    let contactId: number;
    const interest = property || building;
    const unitInterest = unitName || unitType;

    const [existingRows]: any = email
      ? await conn.execute("SELECT id FROM contacts WHERE email = ? LIMIT 1", [email])
      : await conn.execute("SELECT id FROM contacts WHERE phone = ? LIMIT 1", [phone]);

    if (existingRows[0]) {
      contactId = existingRows[0].id;
      await conn.execute(
        `UPDATE contacts SET name = ?, email = NULLIF(?, ''), phone = NULLIF(?, ''),
         property_interest = NULLIF(?, ''), unit_interest = NULLIF(?, ''), last_inquiry_at = NOW() WHERE id = ?`,
        [name, email, phone, interest, unitInterest, contactId]
      );
    } else {
      const [insertResult]: any = await conn.execute(
        `INSERT INTO contacts (name, email, phone, property_interest, unit_interest, last_inquiry_at)
         VALUES (?, NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NOW())`,
        [name, email, phone, interest, unitInterest]
      );
      contactId = insertResult.insertId;
    }

    let status = "New Lead";
    if (action.includes("reserve")) status = "Reserved";
    else if (isAppointment) status = "Site Visit Scheduled";

    const assignedStaffId = await findAssignableStaffId(conn);
    const completedFields = [name, email, phone, prefContact, property, unitName, budgetRange, prefPayment, intendedPurpose, purchaseTimeline, appointmentDate].filter(Boolean).length +
      (message && message !== "Website inquiry." ? 1 : 0);

    const messageWithSubject = subjectLine ? `Subject: ${subjectLine}\n\n${message}` : message;

    const [inquiryResult]: any = await conn.execute(
      `INSERT INTO inquiries
        (property_id, contact_id, name, email, phone, preferred_contact_method, project, unit_name, unit_type,
         budget_range, preferred_payment_method, intended_purpose, purchase_timeline, visit_date, visit_time,
         lead_score, assigned_staff_id, views_count, return_visits_count, completed_fields_count,
         message, source_page_url, lead_source, status)
       VALUES (?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''),
               NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), CAST(NULLIF(?, '') AS date), CAST(NULLIF(?, '') AS time),
               ?, ?, ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, ?)`,
      [
        propertyId,
        contactId,
        name,
        email,
        phone,
        prefContact,
        property,
        unitName,
        unitType,
        budgetRange,
        prefPayment,
        intendedPurpose,
        purchaseTimeline,
        appointmentDate || null,
        appointmentTime || null,
        leadScore,
        assignedStaffId,
        viewsCount,
        returnVisitsCount,
        completedFields,
        messageWithSubject,
        sourcePageUrl,
        leadSource,
        status,
      ]
    );
    const inquiryId = inquiryResult.insertId;

    if (propertyId !== null) {
      await runOptionalTransactionStep(
        conn,
        "property_inquiry_count_update",
        () => conn.execute("UPDATE properties SET inquiries_count = inquiries_count + 1 WHERE id = ?", [propertyId]).then(() => undefined),
        { inquiryId, propertyId }
      );
    }
    if (unitName || building) {
      await runOptionalTransactionStep(
        conn,
        "unit_inquiry_count_update",
        () =>
          conn
            .execute(
              `UPDATE units SET inquiries_count = inquiries_count + 1
               WHERE (? = '' OR name = ? OR type = ?) AND (? = '' OR building = ?)`,
              [unitName, unitName, unitType, building, building]
            )
            .then(() => undefined),
        { inquiryId, unitName, unitType, building }
      );
    }

    let actDetails = "Lead submitted inquiry via Website.";
    if (status === "Site Visit Scheduled") {
      actDetails = `Site visit requested for ${appointmentDate} at ${appointmentTime}.`;
    } else if (status === "Reserved") {
      actDetails = `Reservation request submitted for ${unitName || property}.`;
    }
    if (assignedStaffId !== null) {
      await runOptionalTransactionStep(
        conn,
        "activity_insert",
        () =>
          conn
            .execute(
              `INSERT INTO inquiry_activity (inquiry_id, staff_id, activity_type, details) VALUES (?, ?, ?, ?)`,
              [inquiryId, assignedStaffId, "status_change", actDetails]
            )
            .then(() => undefined),
        { inquiryId, assignedStaffId }
      );
    } else {
      console.warn("Inquiry activity skipped: no staff row available for assignment.", { inquiryId });
    }

    let appointmentCreated = false;
    if (isAppointment) {
      const notes = `${message}\n\nSource: ${sourcePageUrl}`;
      await conn.execute(
        `INSERT INTO appointments
          (inquiry_id, contact_id, title, client_name, client_email, client_phone, property_name, unit_name, notes, appt_date, appt_time, status)
         VALUES (?, ?, 'Site Viewing', ?, NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), ?, ?, ?, 'upcoming')`,
        [inquiryId, contactId, name, email, phone, property, unitName, notes, appointmentDate, appointmentTime]
      );
      appointmentCreated = true;
    }

    const notifTitle = status === "Reserved" ? "New Unit Reservation Request" : isAppointment ? "New Viewing Request" : "New Website Inquiry";
    const subject = unitName || property || "a property";
    const notifMessage = `New ${unitType || "property"} inquiry from ${name} for ${subject}. Lead Score: ${leadScore}.`;
    await runOptionalTransactionStep(
      conn,
      "notification_insert",
      () =>
        conn
          .execute("INSERT INTO notifications (staff_id, title, message, is_read) VALUES (0, ?, ?, 0)", [
            notifTitle,
            notifMessage,
          ])
          .then(() => undefined),
      { inquiryId }
    );

    await conn.commit();
    conn.release();

    let emailSent = false;
    try {
      emailSent = await sendContactEmail({
        name,
        email,
        phone,
        subject: subjectLine,
        message,
        project: property,
        unitName,
        sourcePageUrl,
      });
    } catch (mailError) {
      console.error("Contact notification email failed:", mailError);
    }

    return NextResponse.json({
      success: true,
      message:
        status === "Reserved"
          ? "Reservation request submitted. Our team will review your application shortly."
          : appointmentCreated
          ? "Viewing request submitted. Our team will confirm the appointment shortly."
          : "Inquiry submitted successfully.",
      inquiry_id: inquiryId,
      contact_id: contactId,
      appointment_created: appointmentCreated,
      lead_score: leadScore,
      email_sent: emailSent,
    });
  } catch (e: any) {
    await conn.rollback();
    conn.release();
    logInquiryError("transaction", e, { name, email, phone, property, unitName, propertyIdRaw, action });
    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Failed to save inquiry. Please try again."
            : `Failed to save inquiry: ${e?.message || e?.sqlMessage || String(e)}`,
      },
      { status: 500 }
    );
  }
}
