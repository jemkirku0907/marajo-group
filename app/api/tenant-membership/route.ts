import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTenantMembership, requireActiveTenant, upsertTenantMembership } from "@/lib/tenantMembership";

const VALID_ORGANIZATIONS = new Set(["marajo_group", "officium_inc", "tenant_company"]);

function unauthorized() {
  return NextResponse.json({ success: false, message: "Please log in to manage tenant membership." }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) return unauthorized();

  const action = req.nextUrl.searchParams.get("action") || "me";
  if (action === "status") {
    const result = await requireActiveTenant(user.user_id);
    return NextResponse.json({
      success: true,
      verified: result.ok,
      status: result.status,
      message: result.message,
      membership: result.membership,
    });
  }

  if (action === "me") {
    const membership = await getTenantMembership(user.user_id);
    return NextResponse.json({ success: true, membership });
  }

  return NextResponse.json({ success: false, message: `Tenant endpoint not found: ${action}` }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) return unauthorized();

  const data = await req.json().catch(() => ({}));
  const fullName = String(data.full_name || "").trim();
  const email = String(data.email || user.email || "").trim();
  const companyName = String(data.company_name || "").trim();
  const organization = String(data.organization || "tenant_company").trim();
  const unitNumber = String(data.unit_number || "").trim();
  const floorNumber = String(data.floor_number || "").trim();
  const phone = String(data.phone || "").trim();

  if (!fullName || !email || !companyName || !unitNumber || !floorNumber) {
    return NextResponse.json(
      { success: false, message: "Name, email, company, floor, and unit are required." },
      { status: 400 }
    );
  }
  if (!VALID_ORGANIZATIONS.has(organization)) {
    return NextResponse.json({ success: false, message: "Invalid company/organization selection." }, { status: 400 });
  }

  const membership = await upsertTenantMembership(user.user_id, {
    full_name: fullName,
    email,
    phone,
    company_name: companyName,
    organization,
    unit_number: unitNumber,
    floor_number: floorNumber,
  });

  return NextResponse.json({
    success: true,
    message:
      membership?.membership_status === "active"
        ? "Tenant membership details updated."
        : "Tenant verification submitted. Admin review is required before requests are enabled.",
    membership,
  });
}
