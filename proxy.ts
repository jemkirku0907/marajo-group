import { NextRequest, NextResponse } from "next/server";
import { rejectCrossSiteMutation } from "@/lib/security";

const legacyAdminPrefixes = [
  "/api/admin/appointments",
  "/api/admin/calendar",
  "/api/admin/contacts",
  "/api/admin/facilities",
  "/api/admin/notifications",
  "/api/admin/overview",
  "/api/admin/parking",
  "/api/admin/receipts",
  "/api/admin/tasks",
  "/api/admin/tenants",
  "/api/admin/units",
  "/api/admin/workers",
];

const legacyPublicPrefixes = [
  "/api/facilities",
  "/api/parking",
  "/api/tenant-membership",
  "/api/user",
  "/api/worker",
  "/api/workers",
];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const legacyAdminDisabled = process.env.ENABLE_LEGACY_ADMIN_API !== "true";
  const legacyBookingDisabled = process.env.ENABLE_LEGACY_BOOKING_API !== "true";

  if (legacyAdminDisabled && legacyAdminPrefixes.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.json(
      { success: false, message: "This admin feature is no longer active." },
      { status: 410 },
    );
  }

  if (legacyBookingDisabled && legacyPublicPrefixes.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.json(
      { success: false, message: "This booking API is no longer active." },
      { status: 410 },
    );
  }

  return rejectCrossSiteMutation(req) || NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
