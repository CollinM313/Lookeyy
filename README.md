# Lookeyy

Tour any home from your couch. Lookeyy lets buyers and renters request **live video call tours** or
**recorded video walkthroughs** of properties, conducted by local real estate agents who are onboarded
as vetted "tour partners." Bookings are routed through a smart-matching system that suggests the
best-fit agent, with every assignment confirmed by an admin before the agent is notified.

This is a free platform — there is no payment processing anywhere in the app.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (base-ui flavor)
- **Prisma 5** ORM + **PostgreSQL**
- **NextAuth.js v5 (Auth.js)** — email/password (credentials) + Google OAuth, roles: `CLIENT`, `AGENT`, `ADMIN`
- **Resend** for transactional email (falls back to console logging if unconfigured)
- **Daily.co** for in-app live video calls (falls back to a phone/FaceTime scheduling form if unconfigured)
- **Zustand**-ready client state (not heavily used yet — most state is server-driven)
- Deploy target: **Vercel**

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Postgres

Use a local Postgres instance, or a free hosted one — [Neon](https://neon.tech) or
[Supabase](https://supabase.com) both work well and require no credit card.

Copy the env file and fill in `DATABASE_URL`:

```bash
cp .env.example .env
```

### 3. Run migrations and seed demo data

```bash
npm run db:migrate
npm run db:seed
```

The seed script creates:
- An admin: `admin@lookeyy.com` / `password123`
- A client: `client@lookeyy.com` / `password123`
- 5 approved agents (e.g. `maria@lookeyy.com` / `password123`) across 4 cities, each with availability for the next 7 days
- 1 pending agent application (`pendingagent@lookeyy.com`) so you can see the admin review queue
- 15 listings with photos, and 10 bookings spanning every status (including one with a review)

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

| Variable | Required to run locally? | Purpose |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection string |
| `NEXTAUTH_SECRET` | **Yes** | Session/JWT signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | **Yes** | App URL, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables "Continue with Google". Without it, credentials sign-in still works fully. |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Sends real emails via Resend. Without it, every notification is logged to the server console and still recorded in the `Notification` table. |
| `DAILY_API_KEY` | No | Enables real embedded live video calls at `/tour/[bookingId]/call`. Without it, that page shows a clearly-marked fallback UI for scheduling a phone/FaceTime call instead. |
| `NEXT_PUBLIC_DAILY_DOMAIN` | No | Your Daily.co subdomain, for reference/branding only — not required for the REST API flow used here. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Reserved for a future map view on `/listings`. Not yet wired into a component. |
| `CRON_SECRET` | No | Bearer token required by `/api/cron/reminders`. Leave unset locally; set it in production and point a scheduled job (e.g. Vercel Cron) at that route hourly. |

## What needs real API keys to go fully live

- **Email** — without `RESEND_API_KEY`, emails are stubbed to the console but every notification is
  still persisted in the database, so the in-app experience is unaffected.
- **Live video** — without `DAILY_API_KEY`, the `/tour/[bookingId]/call` page falls back to a phone
  number capture form. Get a free Daily.co account, generate an API key, and set it to enable real
  embedded video rooms (created automatically per booking via the Daily REST API).
- **Google sign-in** — without Google OAuth credentials, only email/password sign-in is available.
- **Maps** — `NEXT_PUBLIC_MAPBOX_TOKEN` is scaffolded in `.env.example` for a future listings map view.

Stripe/payments are intentionally **not** included anywhere in this codebase — Lookeyy is free for users.

## Core flows

- **Smart-match booking** — when a client requests a tour, `src/lib/smart-match.ts` scores all approved
  agents by proximity (haversine distance to the listing), current active-booking load, availability
  overlap with the requested time, and rating. The top suggestion is attached to the booking
  (`PENDING_ADMIN_APPROVAL`) and surfaced in `/dashboard/admin/bookings/queue`, where an admin approves
  the suggestion or picks a different agent. Only then does the booking move to `CONFIRMED` and the
  agent get notified — agents never self-claim requests.
- **Agent onboarding** — public application at `/become-a-partner` creates a `CLIENT`-role user with a
  `PENDING` `AgentProfile`. Admins approve/reject from `/dashboard/admin/agents`; approval flips the
  user's role to `AGENT`.
- **Notifications** — `src/lib/email.ts` sends (or stubs) an email and writes a `Notification` row for
  every state change: booking requested, pending approval, confirmed, agent assigned, 1-hour reminder
  (via the cron route), completed/review request, and agent application approved/rejected.

## Project structure

```
prisma/schema.prisma       Data model
prisma/seed.ts             Demo data seed script
src/app/(marketing)/...    Public site: landing, listings, booking, auth, partner application
src/app/dashboard/...      Role-gated dashboards: client, agent, admin
src/app/tour/[id]/call     Live video call room
src/app/actions/...        Server actions (bookings, agents, listings, reviews, profile, auth)
src/lib/...                Prisma client, auth config, email, smart-match, Daily.co client, constants
src/middleware.ts          Role-based route protection for /dashboard/*
```

## Deploying

1. Push to GitHub and import into Vercel.
2. Add all required env vars from the table above in the Vercel project settings.
3. Point `DATABASE_URL` at a production Postgres instance (Neon/Supabase both have a one-click Vercel integration).
4. Run `npx prisma migrate deploy` against production (via a build step or manually) before first use.
5. (Optional) Add a Vercel Cron job hitting `GET /api/cron/reminders` hourly with header
   `Authorization: Bearer <CRON_SECRET>` to send 1-hour tour reminders.

## Notes

- This project lives in a OneDrive-synced folder; if `npm run build` ever fails with an `EPERM: operation
  not permitted, unlink` error on `.next/`, it's OneDrive briefly locking a file mid-write — delete
  `.next` and rebuild, or pause OneDrive sync for this folder while developing.
