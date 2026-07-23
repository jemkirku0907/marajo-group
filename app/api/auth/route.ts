import { NextRequest, NextResponse } from "next/server";
import { loginUser, registerUser, getCurrentUser } from "@/lib/auth";
import { upsertTenantMembership } from "@/lib/tenantMembership";
import { turnstileEnabled, turnstileSiteKey, verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const PUBLIC_AUTH_ENABLED = process.env.ENABLE_PUBLIC_AUTH === "true";

function publicAuthDisabled() {
  return NextResponse.json(
    { success: false, message: "Public account access is currently disabled." },
    { status: 410 },
  );
}

export async function GET(req: NextRequest) {
  if (!PUBLIC_AUTH_ENABLED) return publicAuthDisabled();
  const action = req.nextUrl.searchParams.get("action");

  if (action === "turnstile-site-key" || action === "security-config") {
    return NextResponse.json({
      success: true,
      turnstile_enabled: turnstileEnabled(),
      site_key: turnstileSiteKey(),
    });
  }

  if (action === "verify-token" || action === "verify") {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: { id: user.user_id, role: user.role } });
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  if (!PUBLIC_AUTH_ENABLED) return publicAuthDisabled();
  const action = req.nextUrl.searchParams.get("action");
  const ip = getClientIp(req);
  const data = await req.json().catch(() => ({}));

  if (action === "register") {
    if (!checkRateLimit(`register_${ip}`, 5, 300)) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    if (!data.email || !data.password) {
      return NextResponse.json({ success: false, message: "Missing required field" }, { status: 400 });
    }
    if (!data.company_name || !data.floor_number) {
      return NextResponse.json(
        { success: false, message: "Company name and floor number are required for tenant access." },
        { status: 400 }
      );
    }

    if (!(await verifyTurnstileToken(data.turnstile_token, ip))) {
      return NextResponse.json(
        { success: false, message: "Please complete the security check and try again." },
        { status: 400 }
      );
    }

    const firstName = (data.first_name || "").trim() || "Customer";
    const lastName = (data.last_name || "").trim() || "User";
    const result = await registerUser(data.email, data.password, firstName, lastName, data.phone || "", "customer");

    if (result.success) {
      await upsertTenantMembership(Number((result as any).user_id), {
        full_name: `${firstName} ${lastName}`.trim(),
        email: data.email,
        phone: data.phone || "",
        company_name: String(data.company_name || "").trim(),
        organization: "tenant_company",
        floor_number: String(data.floor_number || "").trim(),
        unit_number: "",
      });
      const loginResult = await loginUser(data.email, data.password);
      if (loginResult.success && "token" in loginResult) {
        (result as any).token = loginResult.token;
        (result as any).user = loginResult.user;
      }
    }

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  }

  if (action === "login") {
    if (!checkRateLimit(`login_${ip}`, 10, 300)) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    if (!data.email || !data.password) {
      return NextResponse.json({ success: false, message: "Missing email or password" }, { status: 400 });
    }

    if (!(await verifyTurnstileToken(data.turnstile_token, ip))) {
      return NextResponse.json(
        { success: false, message: "Please complete the security check and try again." },
        { status: 400 }
      );
    }

    const result = await loginUser(data.email, data.password);
    // Always 401 on failure — don't distinguish "wrong email" vs "wrong password"
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }
    return NextResponse.json(result, { status: 200 });
  }

  if (action === "logout") {
    // Stateless JWT — logout is a client-side token discard. Kept for parity with PHP route.
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  }

  return NextResponse.json({ success: false, message: "Endpoint not found" }, { status: 404 });
}
