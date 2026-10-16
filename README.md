# Rural_med-Hackathon-Project-

# RuralMed â€” Rural Healthcare Access Platform

**Tagline:** Healthcare access, closer to home.  
**Launch focus:** Rural communities in Jammu and Kashmir, India.  
**Initial delivery model:** Participating pharmacies confirm availability and arrange delivery themselves.  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Supabase/PostgreSQL/Auth/Storage, Vercel and GitHub.

> **Prototype safety notice:** This ZIP is a hackathon-oriented starter with a browser-local demo workflow and a Supabase schema foundation. It is not a production healthcare service. Do not enter real patient details, prescriptions, medical history, licence numbers or other sensitive data in demo mode. No live pharmacy, inventory, prescription review, payment or delivery is connected. Before real transactions, complete security review and confirm applicable Indian legal and regulatory requirements with qualified professionals.

## 1. Features in this ZIP

### Public website
- Responsive RuralMed landing page with custom CSS illustration.
- Navigation, mission, four-step workflow, pharmacy partner section and FAQs.
- About and contact pages.
- Safety notices throughout the application.
- Mobile responsive layout and reduced-motion support.

### Patient demo workflow
- Select Jammu/Kashmir, district and a sample village.
- Submit medicine request details.
- Save a demo request in the current browser using `localStorage`.
- View request list and request details.
- Pharmacy dashboard can create an illustrative quote.
- Patient can accept an illustrative quote and see the demo status update.
- Demo records are browser-local and do not sync between devices or users.

### Pharmacy demo workflow
- Registration form validation with a Pending Verification demo result.
- Demo dashboard listing locally stored requests.
- Illustrative quote entry and status management.
- The demo does not verify pharmacy licences or allow real fulfilment.

### Admin demo workflow
- Basic counts and overview of browser-local demo requests.
- Clear warnings that this route is not a secured administrator portal.
- No real pharmacy approval action is implemented.

### Backend foundation
- Supabase browser and server client helpers.
- Zod request/quote validation.
- Initial SQL migration for profiles, villages, pharmacies, service areas, medicines, inventory, orders, order items, quotes, prescriptions, deliveries, status events and audit logs.
- Row Level Security policies for the main entities.
- Private prescription storage policy starter.
- Sample village lookup seed data only.
- API endpoints explicitly return a not-configured response instead of pretending to persist live data.

## 2. Prerequisites

Install:
- Node.js 20.9+ (LTS recommended).
- npm (included with Node.js).
- Git.
- Visual Studio Code or another code editor.
- A Supabase account for backend setup.

Verify:
```bash
node -v
npm -v
git --version
```

## 3. Install and run

Extract the ZIP, open a terminal in the `ruralmed` directory, then run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, if `cp` does not work:
```powershell
Copy-Item .env.example .env.local
```

Open http://localhost:3000.

Useful routes:
- `/` â€” landing page
- `/find-medicines` â€” medicine access introduction
- `/request-medicine` â€” demo request form
- `/orders` â€” demo request list
- `/orders/RM-...` â€” demo request details (use a generated reference)
- `/pharmacy/register` â€” pharmacy application demo
- `/pharmacy/login` â€” pharmacy portal notice
- `/pharmacy/dashboard` â€” demo pharmacy dashboard
- `/admin/login` â€” admin portal notice
- `/admin/dashboard` â€” demo operations dashboard
- `/about` â€” about RuralMed
- `/contact` â€” demo enquiry form

The browser-local demo uses `localStorage`. Use fictional data only. Clearing browser site data clears the demo records.

## 4. Build, type-check and tests

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If a command fails, copy the complete terminal output and diagnose the specific issue. A successful build confirms compilation, not legal readiness, security readiness or production correctness.

## 5. Environment variables

Copy `.env.example` to `.env.local`.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPPORT_EMAIL=hello@example.com
NEXT_PUBLIC_SUPPORT_PHONE=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key suitable for browser use when RLS is correctly configured.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret. Never expose it in client code, `NEXT_PUBLIC_` variables, screenshots or source control.
- Support email/phone are placeholders; configure real support details before launch.

The current UI defaults to browser-local demo mode. The Supabase helper files are included but the demo pages do not yet use them for live patient data. Do not assume that filling environment variables alone turns on secure production workflows.

## 6. Supabase setup

1. Create a new Supabase project.
2. In the Supabase SQL Editor, run `supabase/migrations/202610160001_initial_schema.sql`.
3. Create a **private** Storage bucket named `prescriptions` with an appropriately small upload limit.
4. Run `supabase/migrations/202610160002_private_storage.sql` after creating the bucket.
5. Run `supabase/seed.sql` for sample village records.
6. Copy the Project URL and anon/publishable key into `.env.local`.
7. Restart the development server after changing environment variables.

Use a disposable development project first. Have a database/security specialist review all RLS policies before storing real data. Some workflows need additional trusted server functions, transaction boundaries and policies before production.

### Critical role provisioning
The user profile trigger assigns every new user the `patient` role. Do not allow users to set their own role through user metadata or a client update. Pharmacy and admin role assignment must be performed only by a trusted administrator/server process after identity and licence checks. Never promote an account to admin through an unauthenticated UI.

### Private prescription storage
- Keep the bucket private.
- Never use public URLs for prescriptions.
- Check patient ownership or pharmacy assignment on the server before generating short-lived signed URLs.
- Limit file types and size; inspect uploads, log access and apply a retention/deletion policy.
- The included storage policy is a starting point, not a complete prescription-review implementation.

## 7. Database model

| Table | Purpose |
|---|---|
| `profiles` | User profile and controlled role |
| `villages` | Region, district and village directory |
| `pharmacies` | Licence information and verification state |
| `pharmacy_service_areas` | Villages each pharmacy serves |
| `medicines` | Approved catalogue metadata and prescription flag |
| `pharmacy_inventory` | Pharmacy-maintained availability notes and indicative prices |
| `orders` | Patient medicine requests and overall status |
| `order_items` | Requested medicine line items |
| `pharmacy_quotes` | Pharmacy price, delivery fee and confirmation flags |
| `prescriptions` | Private storage path and review state |
| `deliveries` | Pharmacy-arranged delivery state |
| `order_status_events` | Status history |
| `audit_logs` | Sensitive administrative audit trail |

Order states:
- Requested
- Under Review
- Quoted
- Accepted
- Preparing
- Out for Delivery
- Delivered
- Rejected
- Cancelled
- Delivery Failed

Before production, implement a server-side state transition function that verifies actor, pharmacy assignment, order state, prescription status and availability. The starter SQL does not by itself implement every transaction or status-transition rule required for live use.

## 8. Security and compliance checklist before real users

- [ ] Confirm current Indian medicine sale, pharmacy licensing, prescription, delivery, privacy, consumer protection and other applicable requirements with qualified counsel/regulatory experts.
- [ ] Confirm which medicines are eligible; exclude prohibited or otherwise ineligible products.
- [ ] Verify pharmacy licences and periodically re-verify them.
- [ ] Implement Supabase Auth sign-up, sign-in, email verification, recovery and secure session refresh.
- [ ] Create protected server routes and verify role and ownership on every sensitive action.
- [ ] Review and test every RLS policy using patient, pharmacy, admin and unauthenticated test accounts.
- [ ] Do not allow clients to set `profiles.role`, pharmacy verification state, quote ownership or order status arbitrarily.
- [ ] Implement atomic quote acceptance to prevent accepting multiple competing quotes.
- [ ] Add server-side order transition validation and immutable status events.
- [ ] Implement secure prescription upload, scanning, private signed URLs, access logs and deletion/retention rules.
- [ ] Add rate limiting, anti-abuse controls, CSRF/session review, secure headers, monitoring and backups.
- [ ] Add consent and privacy notices in relevant languages before collecting personal data.
- [ ] Configure a real support inbox and complaint handling.
- [ ] Conduct a security review and end-to-end tests before production.
- [ ] Do not claim real inventory, delivery coverage or pharmacy partnerships until verified.

RuralMed must not diagnose patients, prescribe medicines, recommend independent substitution of prescriptions or act as an emergency service.

## 9. Development roadmap

### Phase 1 â€” Foundation
- [x] Next.js, TypeScript and Tailwind foundation.
- [x] Responsive landing page and shared navigation/footer.
- [x] Initial public routes and visual design system.

### Phase 2 â€” Database and authentication
- [x] Initial schema and starter RLS migration included.
- [x] Supabase client helpers included.
- [ ] Wire real Supabase Auth and protected session flows.
- [ ] Test and harden RLS with multiple roles.
- [ ] Generate current database types from deployed schema.

### Phase 3 â€” Patient features
- [x] Browser-local demo medicine request.
- [x] Demo request list and details.
- [ ] Persist requests securely in Supabase.
- [ ] Private prescription uploads and review flow.
- [ ] Saved addresses, consent, cancellation and support.

### Phase 4 â€” Pharmacy features
- [x] Demo registration form and dashboard.
- [x] Demo quote and status interactions.
- [ ] Verified pharmacy application storage and admin approval.
- [ ] Service-area matching, assigned requests and inventory review.
- [ ] Secure quote submission and fulfilment workflow.

### Phase 5 â€” Admin and matching
- [x] Basic demo operations overview.
- [ ] Protected admin access and audit logging.
- [ ] Pharmacy approval/suspension actions.
- [ ] Village matching and complaint management.
- [ ] Real operational analytics.

### Phase 6 â€” Testing and deployment
- [x] Initial test files included.
- [ ] Run all tests and fix environment-specific issues.
- [ ] Add end-to-end browser tests and authorization tests.
- [ ] Deploy to Vercel with environment variables.
- [ ] Configure domain, support, monitoring and privacy pages.
- [ ] Run hackathon demo using clearly labelled fictional data.

## 10. Known limitations

1. **Demo storage is local to one browser.** It is not a shared database and is not an account system.
2. **Authentication is not wired to the demo dashboards.** Pharmacy and admin demo routes are publicly reachable and must not be used as real portals.
3. **The request and quote API routes are placeholders.** They validate data but do not persist live requests or quotes.
4. **No real pharmacy matching or inventory is connected.** Village lists are illustrative.
5. **No prescription upload is implemented in the UI.** The schema and storage migration are only a starting point.
6. **No payments, real delivery booking, live GPS or route optimization are implemented.**
7. **Contact form is demo-only.** It does not send email.
8. **The supplied SQL policies require expert review and additional trusted transaction logic.** Do not use as-is for real patient data.
9. **No pharmacy partnership, service coverage or medicine availability is represented as verified.**
10. **Legal and regulatory review is required before enabling real transactions.**

## 11. Deployment to Vercel

1. Push the project to a private or public GitHub repository as appropriate.
2. Import the repository into Vercel.
3. Add environment variables in Vercel Project Settings.
4. Deploy a staging version first.
5. Verify build, authentication, RLS and all role-specific flows.
6. Do not deploy the publicly accessible demo admin dashboard as a real admin portal.
7. Complete the security/compliance checklist before accepting real medicine requests.

## 12. Git commands

```bash
git init
git add .
git commit -m "Build RuralMed prototype"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL. Do not commit `.env.local`.

## 13. Troubleshooting

- **Port 3000 busy:** Next.js may offer another port; use the URL printed in terminal.
- **Missing module:** Run `npm install`, then restart `npm run dev`.
- **Environment variable changes not appearing:** Restart the dev server.
- **Tailwind styles missing:** Confirm `postcss.config.mjs` uses `@tailwindcss/postcss` and `globals.css` starts with `@import "tailwindcss";`.
- **Supabase helper throws missing env error:** Set URL/key in `.env.local`; this does not automatically activate the demo pages as backend-connected pages.
- **Build/type errors:** Run `npm run typecheck` and `npm run build`, then inspect the first reported error.
- **Demo requests missing:** They are stored in the same browser profile and origin using `localStorage`.

## 14. Project principle

**Build the safe, useful core first:** patient request â†’ approved pharmacy review â†’ transparent quote â†’ patient acceptance â†’ pharmacy-arranged delivery and status tracking. Keep diagnosis, prescribing, live payments, native apps, AI diagnosis, GPS routing and advanced analytics out of the initial MVP.
