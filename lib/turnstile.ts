export function turnstileSiteKey(): string {
  return process.env.TURNSTILE_SITE_KEY || "";
}

function turnstileSecretKey(): string {
  return process.env.TURNSTILE_SECRET_KEY || "";
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey() !== "" && turnstileSecretKey() !== "";
}

export async function verifyTurnstileToken(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;

  const trimmed = (token || "").trim();
  if (trimmed === "") return false;

  try {
    const body = new URLSearchParams({
      secret: turnstileSecretKey(),
      response: trimmed,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.success);
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
