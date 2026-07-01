# Marajo Group — Next.js Conversion (Phase 1)

Converted from the PHP source in `convert.zip` (auth/parking/court-booking/workforce/contact system).

## What's done (backend + booking flow)

- **Auth** (`lib/auth.ts`, `app/api/auth/route.ts`) — JWT login/register/verify, bcrypt passwords, same behavior as `AuthService.php` (no email enumeration, 401-only failures).
- **Turnstile** (`lib/turnstile.ts`) — server-side verify, `?action=turnstile-site-key` config endpoint, auto-disabled when keys are empty.
- **Rate limiting** (`lib/rateLimit.ts`) — in-memory port of the PHP session-based limiter (5 register / 10 login per 5 min).
- **Mailer** (`lib/mail.ts`) — same HTML receipt templates (parking / court / workforce) via SMTP (nodemailer). No-ops with a console log if `SMTP_HOST` isn't set, so local dev never breaks.
- **Parking** (`app/api/parking/route.ts`, `app/parking/page.tsx`) — availability check + reserve, row-locking via transaction, fee calc identical to PHP.
- **Facilities / Court booking** (`app/api/facilities/route.ts`, `app/facilities/page.tsx`) — single court, ₱1000/hr flat, based on the real `api/facilities.php` (the orphaned `api/facilities/availability.php` + `book.php` referencing a `facilities` table that doesn't exist in your schema were **not** ported — they were dead code).
- **Workforce** (`app/api/workers/route.ts`, `app/workforce/page.tsx`) — `available-workers` + `book` (public booking flow only; internal job-posting/worker-application/payroll endpoints from `WorkforceService.php` were not ported since nothing public-facing uses them yet).
- **User profile + history** (`app/api/user/route.ts`) — combined parking/court/workforce history, same as `api/user.php`.
- **Contact / inquiries** (`app/api/inquiries/route.ts`, `app/contact/page.tsx`) — public, no auth, full lead-scoring logic ported from `submit_inquiry.php` (requires `upgrade_schema.sql` to have been run — it adds `lead_score`, `inquiry_activity`, etc.)
- **Auth modal system** (`lib/AuthContext.tsx`, `components/AuthModal.tsx`, `components/AccountModal.tsx`, `components/Navbar.tsx`) — login/register as a modal (not a redirect page), user dropdown with initials avatar, account/history modal with print-receipt button.
- **Search** (`lib/searchIndex.ts`, `app/search/`) — ported the static client-side search index + scoring algorithm from `search-index.js` / `search-page.js`.

`npm run build` passes clean.

## What's NOT done yet (next phase)

- Marketing/content pages: `/about`, `/properties` (+ detail pages), `/gallery`, `/news`, `/`  (home) — these are large static HTML files with lots of copy/images that still need to be ported page by page.
- Staff/admin panels (`dashboard.php`, `api/admin/*`) — session-based staff login, lead CRM, parking/court/worker management. Not started.
- `logout.php` equivalent — since auth is stateless JWT now, "logout" is just clearing the token client-side (already wired in `AuthContext.logout()`); there's nothing server-side to port.

## Setup

1. `cp .env.local.example .env.local` and fill in `DB_HOST/DB_USER/DB_PASS/DB_NAME`, a random `JWT_SECRET`, and (optionally) Turnstile + SMTP creds.
2. Run all the `sql/*.sql` files against your DB in this order: `schema.sql`, `parking_workforce_schema.sql`, `court_schema.sql`, `worker_bookings_schema.sql`, `upgrade_schema.sql`, `staff_login.sql`.
3. `npm install && npm run dev`
