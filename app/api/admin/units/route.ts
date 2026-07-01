import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/staffAuth";
import { db } from "@/lib/db";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
}

const UNIT_STATUSES = ["available", "reserved", "sold", "unavailable", "active", "inactive"];

/**
 * GET /api/admin/units
 *   ?action=list -> all units with property name
 */
export async function GET(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "list";

  if (action === "list") {
    const rows = await db.query(
      `SELECT u.*, p.name AS property_name
       FROM units u
       LEFT JOIN properties p ON u.property_id = p.id
       ORDER BY u.created_at DESC`
    );
    const properties = await db.query("SELECT id, name FROM properties ORDER BY name ASC");
    return NextResponse.json({ success: true, units: rows, count: rows.length, properties });
  }

  return NextResponse.json({ success: false, message: `Admin units endpoint not found: ${action}` }, { status: 404 });
}

/**
 * POST /api/admin/units
 *   ?action=create -> insert new unit
 *   ?action=update -> update unit fields/status
 *   ?action=delete -> remove unit
 */
export async function POST(req: NextRequest) {
  const staff = requireAdmin(req);
  if (!staff) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") ?? "";
  const data = await req.json().catch(() => ({}));

  if (action === "create") {
    const name = String(data.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ success: false, message: "Unit name is required." }, { status: 400 });
    }
    const propertyId = data.property_id ? Number(data.property_id) : null;
    const type = String(data.type ?? "").trim() || null;
    const building = String(data.building ?? "").trim() || null;
    const location = String(data.location ?? "").trim() || null;
    const status = UNIT_STATUSES.includes(data.status) ? data.status : "available";
    const price = String(data.price ?? "").trim() || null;

    const result = await db.execute(
      `INSERT INTO units (property_id, name, type, building, location, status, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [propertyId, name, type, building, location, status, price]
    );

    return NextResponse.json({ success: true, message: "Unit created.", id: result.insertId });
  }

  if (action === "update") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid unit ID." }, { status: 400 });
    }
    const status = data.status;
    if (status && !UNIT_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: `Invalid status: ${status}` }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];
    const map: Record<string, any> = {
      property_id: data.property_id ? Number(data.property_id) : undefined,
      name: data.name !== undefined ? String(data.name).trim() : undefined,
      type: data.type !== undefined ? String(data.type).trim() : undefined,
      building: data.building !== undefined ? String(data.building).trim() : undefined,
      location: data.location !== undefined ? String(data.location).trim() : undefined,
      status: status !== undefined ? status : undefined,
      price: data.price !== undefined ? String(data.price).trim() : undefined,
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
    await db.execute(`UPDATE units SET ${fields.join(", ")} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: "Unit updated." });
  }

  if (action === "delete") {
    const id = Number(data.id ?? 0);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid unit ID." }, { status: 400 });
    }
    await db.execute("DELETE FROM units WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Unit deleted." });
  }

  return NextResponse.json({ success: false, message: `Admin units endpoint not found: ${action}` }, { status: 404 });
}
