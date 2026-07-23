import { NextRequest, NextResponse } from "next/server";

export class RequestBodyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function readJsonBody<T extends Record<string, unknown>>(
  req: NextRequest,
  maxBytes = 32_768,
): Promise<T> {
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  try {
    return (raw ? JSON.parse(raw) : {}) as T;
  } catch {
    throw new RequestBodyError("Request body must be valid JSON.", 400);
  }
}

export function rejectCrossSiteMutation(req: NextRequest): NextResponse | null {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase())) return null;

  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json({ success: false, message: "Cross-site request blocked." }, { status: 403 });
  }

  const origin = req.headers.get("origin");
  if (!origin) return null;

  const configuredOrigin = process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL;
  const expectedOrigin = configuredOrigin ? new URL(configuredOrigin).origin : req.nextUrl.origin;
  try {
    if (new URL(origin).origin !== expectedOrigin) {
      return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, message: "Request origin is invalid." }, { status: 403 });
  }

  return null;
}

export const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};
