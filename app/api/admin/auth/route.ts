import { NextRequest, NextResponse } from "next/server";
import {
  loginStaff,
  getCurrentStaff,
  checkStaffRateLimit,
  recordStaffLoginFailure,
  clearStaffLoginFailures,
  STAFF_COOKIE,
} from "@/lib/staffAuth";
import { turnstileEnabled, turnstileSiteKey, verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIp } from "@/lib/rateLimit";
import { noStoreHeaders, readJsonBody, RequestBodyError } from "@/lib/security";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "me";

  if (action === "me") {
    const staff = getCurrentStaff(req);
    if (!staff) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: true,
        staff: { id: staff.staff_id, name: staff.name, role: staff.role, role_code: staff.role_code, company_code: staff.company_code },
      },
      { headers: noStoreHeaders },
    );
  }

  if (action === "turnstile-site-key" || action === "security-config") {
    return NextResponse.json({
      success: true,
      turnstile_enabled: turnstileEnabled(),
      site_key: turnstileSiteKey(),
    });
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "login";
  const ip = getClientIp(req);

  if (action === "login") {
    if (!(await checkStaffRateLimit(ip))) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    let data: Record<string, any>;
    try {
      data = await readJsonBody<Record<string, any>>(req, 16_384);
    } catch (error) {
      const status = error instanceof RequestBodyError ? error.status : 400;
      return NextResponse.json({ success: false, message: "Invalid login request." }, { status });
    }
    const email = String(data.email ?? "").trim();
    const password = String(data.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Please enter both email and password." }, { status: 400 });
    }

    if (!(await verifyTurnstileToken(data.turnstile_token, ip))) {
      return NextResponse.json(
        { success: false, message: "Please complete the security check and try again." },
        { status: 400 }
      );
    }

    const result = await loginStaff(email, password);
    if (!result.success || !result.token) {
      await recordStaffLoginFailure(ip);
      return NextResponse.json({ success: false, message: result.message }, { status: 401 });
    }

    await clearStaffLoginFailures(ip);

    const res = NextResponse.json(
      { success: true, message: result.message, staff: result.staff },
      { headers: noStoreHeaders },
    );
    res.cookies.set(STAFF_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60,
    });
    return res;
  }

  if (action === "logout") {
    const res = NextResponse.json({ success: true, message: "Logged out" }, { headers: noStoreHeaders });
    res.cookies.set(STAFF_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}
