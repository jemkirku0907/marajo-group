import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function val(data: Record<string, any>, keys: string[], def = ""): string {
  for (const k of keys) {
    if (data[k] !== undefined && String(data[k]).trim() !== "") return String(data[k]).trim();
  }
  return def;
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
  const message = val(data, ["message"], "Website inquiry.");
  const sourcePageUrl = val(data, ["source_page_url", "source_url"], req.headers.get("referer") || "");
  const leadSource = val(data, ["lead_source"], "Website");
  const action = val(data, ["action", "inquiry_type"]).toLowerCase();

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

    const assignedStaffId = 1;
    const completedFields = [name, email, phone, prefContact, property, unitName, budgetRange, prefPayment, intendedPurpose, purchaseTimeline, appointmentDate].filter(Boolean).length +
      (message && message !== "Website inquiry." ? 1 : 0);

    const [inquiryResult]: any = await conn.execute(
      `INSERT INTO inquiries
        (property_id, contact_id, name, email, phone, preferred_contact_method, project, unit_name, unit_type,
         budget_range, preferred_payment_method, intended_purpose, purchase_timeline, visit_date, visit_time,
         lead_score, assigned_staff_id, views_count, return_visits_count, completed_fields_count,
         message, source_page_url, lead_source, status)
       VALUES (?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''),
               NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''),
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
        message,
        sourcePageUrl,
        leadSource,
        status,
      ]
    );
    const inquiryId = inquiryResult.insertId;

    if (propertyId !== null) {
      await conn.execute("UPDATE properties SET inquiries_count = inquiries_count + 1 WHERE id = ?", [propertyId]);
    }
    if (unitName || building) {
      await conn.execute(
        `UPDATE units SET inquiries_count = inquiries_count + 1
         WHERE (? = '' OR name = ? OR type = ?) AND (? = '' OR building = ?)`,
        [unitName, unitName, unitType, building, building]
      );
    }

    let actDetails = "Lead submitted inquiry via Website.";
    if (status === "Site Visit Scheduled") {
      actDetails = `Site visit requested for ${appointmentDate} at ${appointmentTime}.`;
    } else if (status === "Reserved") {
      actDetails = `Reservation request submitted for ${unitName || property}.`;
    }
    await conn.execute(
      `INSERT INTO inquiry_activity (inquiry_id, staff_id, activity_type, details) VALUES (?, ?, 'status_change', ?)`,
      [inquiryId, assignedStaffId, actDetails]
    );

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
    await conn.execute("INSERT INTO notifications (staff_id, title, message, is_read) VALUES (0, ?, ?, 0)", [
      notifTitle,
      notifMessage,
    ]);

    await conn.commit();
    conn.release();

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
    });
  } catch (e: any) {
    await conn.rollback();
    conn.release();
    console.error("Inquiry submission error:", e);
    return NextResponse.json({ success: false, message: "Failed to save inquiry. Please try again." }, { status: 500 });
  }
}
