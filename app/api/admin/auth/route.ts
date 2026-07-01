import { NextRequest, NextResponse } from "next/server";
import {
  loginStaff,
  getCurrentStaff,
  checkStaffRateLimit,
  recordStaffLoginFailure,
  clearStaffLoginFailures,
  STAFF_COOKIE,
} from "@/lib/staffAuth";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "me";

  if (action === "me") {
    const staff = getCurrentStaff(req);
    if (!staff) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      staff: { id: staff.staff_id, name: staff.name, role: staff.role, role_code: staff.role_code },
    });
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "login";
  const ip = getClientIp(req);

  if (action === "login") {
    if (!checkStaffRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    const data = await req.json().catch(() => ({}));
    const email = (data.email ?? "").trim();
    const password = data.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Please enter both email and password." }, { status: 400 });
    }

    const result = await loginStaff(email, password);
    if (!result.success || !result.token) {
      recordStaffLoginFailure(ip);
      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }

    clearStaffLoginFailures(ip);

    const res = NextResponse.json({ success: true, message: result.message, staff: result.staff });
    res.cookies.set(STAFF_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return res;
  }

  if (action === "logout") {
    const res = NextResponse.json({ success: true, message: "Logged out" });
    res.cookies.set(STAFF_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}
