# RuralMed â€” Rural Healthcare Access Platform

**Tagline:** Healthcare access, closer to home.  
**Launch focus:** Rural communities across the Kashmir Valley and Jammu region, India.  
**Initial delivery model:** Pharmacy-arranged delivery; participating pharmacies confirm availability and coordinate fulfilment.  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Supabase Auth, PostgreSQL, Row Level Security (RLS), Supabase Storage foundation, Vercel and GitHub.

> **Prototype safety notice:** RuralMed is a hackathon prototype, not a licensed healthcare service. The local demo uses fictional data and browser storage. The live Supabase path is a development workflow and has not undergone a formal security, privacy, clinical, regulatory or operational review. Do not use it for real patient data, real prescriptions or live medicine transactions until all review gates are complete. It is not an emergency service and does not diagnose or prescribe.

## 1. What's included

### Public website
- Responsive landing page, About, Contact and medicine-access routes.
- Shared navigation/footer and RuralMed visual system.
- Public patient request flow with a clearly labelled local demo mode.

### Patient workflow
- Choose Jammu or Kashmir, district and village/town.
- Enter requested medicine details, quantity, delivery location and contact number.
- In demo mode, save a browser-local request and illustrative quote.
- With Supabase configured and the patient signed in, submit a request to PostgreSQL and list/view the authenticated user's requests.
- View quotes and accept one quote through a server-side database function that locks the order row to prevent accepting competing quotes twice.

### Pharmacy workflow
- Submit a pending pharmacy application after signing in.
- A new application is inactive and cannot quote live requests until an administrator verifies and approves it.
- Approved active pharmacies can view open requests in their registered district, submit quotes, and update delivery statuses for accepted quotes.
- Quote submission and delivery transitions use server-side PostgreSQL functions and ownership checks.

### Administrator workflow
- Protected live admin overview and counts.
- List pharmacy applications and approve, reject, suspend or reactivate an application.
- Admin actions require a profile with the `admin` role and are checked again by server APIs/RLS.
- Demo mode has a browser-local overview that is explicitly not an admin portal.

### Backend foundation
- Supabase SSR browser/server clients and session-refresh middleware.
- Email/password sign-up and sign-in, email verification callback and sign-out action.
- Zod validation for requests, quotes and order actions.
- SQL migrations for profiles, villages, pharmacy applications, requests, quotes, delivery records, event history and audit logs.
- RLS policies plus server-side RPCs for quote submission, quote acceptance and delivery updates.
- Private prescription Storage policy starter (prescription upload/review UI is not complete).
- Unit tests for selected status/permission helpers.

## 2. Prerequisites

Install:
- Node.js 20.9+ (Node 22 LTS is suitable).
- npm.
- Git.
- Visual Studio Code or another code editor.
- A Supabase project for live mode.

Verify:
```bash
node -v
npm -v
git --version
```

## 3. Install and run locally

Extract the ZIP, open a terminal in the `ruralmed` folder, then run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell equivalent:
```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Useful routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/find-medicines` | Medicine-access information |
| `/request-medicine` | Patient request form; demo or live depending on environment variables |
| `/orders` | Patient's request list |
| `/orders/[id]` | Request details and quotes |
| `/auth/register` | Patient sign-up |
| `/auth/login` | Shared account sign-in |
| `/auth/forgot-password` | Recovery setup notice; recovery is not implemented |
| `/pharmacy/register` | Pharmacy application form |
| `/pharmacy/login` | Pharmacy partner sign-in information |
| `/pharmacy/dashboard` | Pharmacy request/quote/delivery workspace |
| `/admin/login` | Administrator sign-in information |
| `/admin/dashboard` | Admin overview and pharmacy application actions |
| `/about` | About RuralMed |
| `/contact` | Contact information/form |

## 4. Demo mode vs. connected mode

The app uses **demo mode** when either Supabase public environment variable is blank. Demo requests and quotes are stored in `localStorage` on the current browser only; they do not sync between devices and are not visible to real pharmacies.

The app uses **connected mode** when both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set at build/run time. In connected mode:
- Authentication uses Supabase Auth.
- Patient requests are written to the database only for signed-in patient accounts.
- Request lists and detail pages read the signed-in patient's records under RLS.
- Approved pharmacies can submit quotes and update assigned delivery states.
- Admin APIs require the `admin` profile role.

**Do not assume that setting environment variables alone makes the platform production-ready.** A configured database, applied migrations, correct email redirect settings, provisioned admin, approved pharmacy, tests and a security review are required. Keep `.env.local` out of Git.

## 5. Configure Supabase

1. Create a new Supabase project for development/testing.
2. Open the project's SQL Editor.
3. Run the migrations in numeric order:
   - `supabase/migrations/202610160001_initial_schema.sql`
   - `supabase/migrations/202610160002_private_storage.sql` (create the private `prescriptions` bucket first, with a restrictive upload limit)
   - `supabase/migrations/202610160003_live_workflows.sql`
4. Run `supabase/seed.sql` to insert the non-sensitive village directory.
5. In Supabase project settings, copy the Project URL and publishable/anon key into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=hello@example.com
NEXT_PUBLIC_SUPPORT_PHONE=
```

6. In Supabase Auth URL Configuration, add `http://localhost:3000/auth/callback` to allowed redirect URLs. Before deployment, add the exact production callback URL too.
7. Ensure email confirmation is configured for your development workflow. The signup page expects users to click the verification email when confirmation is enabled.
8. Restart `npm run dev` after changing `.env.local`.

The app does not need a service-role key for its current user-facing workflows. Never expose a Supabase service-role/secret key to the browser or commit it to Git.

### First administrator provisioning

Public registration always creates a `patient` profile. Never add an admin selection to public sign-up. For a disposable development project, create your own account through `/auth/register`, verify it, then run this statement in the Supabase SQL Editor after substituting the account email:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('YOUR_ADMIN_EMAIL');
```

Do not expose the SQL editor or database credentials to users. Limit the admin role to trusted project operators. After assigning the role, sign in again so the session/profile checks use the updated role.

### Pharmacy verification flow

1. A prospective pharmacy creates a normal account at `/auth/register`.
2. The user signs in and submits `/pharmacy/register`.
3. The application is saved with `verification_status = 'pending'` and `is_active = false`.
4. An administrator checks the licence and supporting information outside the prototype, then approves or rejects the application in `/admin/dashboard`.
5. Approval changes the pharmacy record to approved/active and sets the profile role to `pharmacy`. Approval is not automatic and is not a substitute for the required formal licence verification.

For initial development, request matching is district-level. A pharmacy can be assigned detailed village service areas later; once service areas exist for a pharmacy, the quote RPC restricts quotes to those areas.

## 6. Database model

| Table | Purpose |
|---|---|
| `profiles` | User profile and controlled application role |
| `villages` | Region, district and village directory |
| `pharmacies` | Pharmacy details, licence reference and verification state |
| `pharmacy_service_areas` | Optional detailed village coverage for a pharmacy |
| `medicines` | Approved catalogue metadata and prescription flag |
| `pharmacy_inventory` | Pharmacy-maintained availability notes and indicative prices |
| `orders` | Patient request and overall order status |
| `order_items` | Medicine lines and quantities requested |
| `pharmacy_quotes` | Pharmacy price, delivery fee and availability/prescription flags |
| `prescriptions` | Private Storage path and review state |
| `deliveries` | Pharmacy-arranged delivery state |
| `order_status_events` | Status history |
| `audit_logs` | Administrative audit trail |

Order statuses in the database use lowercase values such as `requested`, `quoted`, `accepted`, `preparing`, `out_for_delivery`, `delivered`, `rejected`, `cancelled` and `delivery_failed`. The UI formats these for display.

## 7. API endpoints

| Endpoint | Method | Purpose / access |
|---|---|---|
| `/api/requests` | `POST` | Authenticated patient submits a request; validates input and village directory |
| `/api/requests` | `GET` | Authenticated patient sees own requests; approved pharmacy sees district requests/assigned deliveries; admin can inspect requests |
| `/api/orders` | `GET` | Patient's own requests and quote details |
| `/api/orders` | `PATCH` | Accept a quote or update delivery state via validated RPC |
| `/api/orders/[id]` | `GET` | Authenticated patient's own request details |
| `/api/quotes` | `POST` | Approved active pharmacy submits a quote after confirming availability |
| `/api/pharmacy-applications` | `POST` | Signed-in user submits a pending pharmacy application |
| `/api/admin/overview` | `GET` | Admin-only operational counts |
| `/api/admin/pharmacies` | `GET` | Admin-only application list |
| `/api/admin/pharmacies` | `PATCH` | Admin-only approve/reject/suspend/reactivate actions |

All sensitive endpoints use the signed-in Supabase user and RLS. The `SUPABASE_SERVICE_ROLE_KEY` is intentionally not used in the current API layer.

## 8. Tests and build checks

Run:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The checks require dependency installation and a compatible Node/npm environment. A successful compile does not prove the RLS policies are correct or that the platform is legally/operationally ready. Test with separate patient, pending pharmacy, approved pharmacy, admin and unauthenticated accounts in a disposable project.

## 9. Security and compliance checklist before any real users

- [ ] Have qualified Indian regulatory/legal professionals confirm medicine-sale, pharmacy licensing, prescription, delivery, privacy, consumer-protection and other applicable requirements.
- [ ] Confirm eligible product scope; exclude prohibited or otherwise ineligible medicines.
- [ ] Verify pharmacy licences and re-verify them periodically; define suspension/complaint handling.
- [ ] Review every RLS policy with separate patient, pharmacy, admin and unauthenticated test accounts.
- [ ] Add automated tests for every RPC, RLS policy, role transition and order status transition.
- [ ] Implement secure prescription upload/review, private signed URLs, malware/content inspection, access logs and retention/deletion rules before collecting prescriptions.
- [ ] Add rate limiting, anti-abuse controls, secure headers, monitoring, backups and incident response.
- [ ] Add privacy notice, consent, retention policy, access/deletion process and localized content before collecting personal data.
- [ ] Confirm contact details, complaint handling and operational support.
- [ ] Test email confirmation, password recovery, session expiration and account deletion.
- [ ] Ensure only trusted operators can provision administrators and approve pharmacies.
- [ ] Test concurrency and failure recovery for quote acceptance, quote submission and delivery transitions.
- [ ] Conduct an independent security review and end-to-end test before production.

RuralMed must not diagnose patients, prescribe medicines, recommend independent prescription substitutions or claim a pharmacy has stock until the pharmacy has explicitly confirmed it. It is not an emergency service.

## 10. Roadmap / known gaps

### Implemented in this update
- [x] Supabase email/password sign-up and sign-in actions.
- [x] Email verification callback and session-refresh middleware.
- [x] Authenticated patient request creation and request listing/detail reads.
- [x] Pharmacy application submission with pending/inactive status.
- [x] Admin-only application review actions and basic live counts.
- [x] Approved-pharmacy quote submission with server-side validation.
- [x] Atomic request creation, quote acceptance and one-quote acceptance per order.
- [x] Server-side delivery state transitions for accepted orders.
- [x] Expanded README and setup/security instructions.

### Still to implement before a pilot
- [ ] Password recovery email flow and account deletion.
- [ ] Prescription upload UI and safe review workflow.
- [ ] Pharmacy document upload and a formal licence verification checklist.
- [ ] Detailed service-area management UI; current request matching starts at district level.
- [ ] Add retry/idempotency keys for request submission and delivery updates.
- [ ] Stronger transactional audit trail and admin action notification.
- [ ] Patient cancellation, pharmacy decline reasons, support/complaint workflow and notification emails/SMS.
- [ ] End-to-end browser tests and RLS tests run against a real disposable Supabase project.
- [ ] Mobile accessibility review, translated content and production deployment.

Postpone native apps, AI diagnosis/recommendations, live GPS tracking, route optimization, online payments and complex analytics until the core verified pharmacy workflow has passed review.
