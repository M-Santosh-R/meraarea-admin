# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Internal admin panel (package name `meraarea-admin`) and public read API for **MeraArea**, a hyperlocal business directory. Businesses are organized under **Areas** (country → state → city → locality) and **Categories**, with **Services** attached for search/filtering. Every business gets its own page, e.g. `meraarea.in/ahmedabad/vikram-dental-care`. The public frontend that consumes this API lives in the sibling `../meraarea-web` project.

## Commands

```bash
npm run dev              # start dev server (Turbopack), http://localhost:3000 — root redirects to /dashboard
npm run build
npm run lint
npx prisma migrate dev   # after changing prisma/schema.prisma — creates a migration and applies it
npx prisma migrate deploy
npm run seed              # tsx prisma/seed.ts — deterministic (fixed PRNG seed), safe to rerun
```

There is no test suite. `DATABASE_URL` must be set in `.env` (Supabase: use the **Session pooler** URI, not the direct connection — the direct host is IPv6-only).

## Architecture

- **Next.js 16** App Router with Turbopack. Note: `middleware.ts` was renamed to `proxy.ts` (`src/proxy.ts`) in Next 16 — same mechanism (gates every non-`/login`, non-API route behind a signed-in Supabase user; redirects signed-out users to `/login` and signed-in users away from `/login`).
- **Prisma 7** with the `@prisma/adapter-pg` driver adapter, on Postgres (Supabase). Schema in `prisma/schema.prisma` — read the comment at its top before modifying, it links to the original design doc.
- **Auth**: Supabase Auth for session/login (`src/lib/supabase/`), but authorization is resolved against the app's own `Admin` table by email (`src/lib/auth/session.ts`). `getCurrentAdminFromSession()` returns null on no match (safe for Server Components); `requireAdmin()` throws and **must be called first in every Server Action** in `src/lib/actions/*.ts` — Server Actions are reachable directly over the network, so proxy-level gating alone isn't enough.
- **Data flow is split into two parallel layers, both routed through `src/lib/prisma.ts`:**
  - `src/lib/data/` — read helpers for admin Server Components (dashboard, tables, edit forms).
  - `src/lib/actions/` — `"use server"` Server Actions for admin create/update/delete, called from client forms. No client-side data store (e.g. no React Query) — mutations go straight through Server Actions and rely on `revalidatePath`.
  - `src/lib/api/public/` — a third, separate layer of read helpers + serializers backing the public API routes (`src/app/api/**`). Public routes are unauthenticated, GET-only, and always filtered to published/active data (a business is hidden if it, its area, or its category is unpublished); area lookups roll up businesses from descendant areas.
  - Serializers (`src/lib/data/serializers.ts` vs `src/lib/api/public/serializers.ts`) are deliberately separate — admin views can see draft/unpublished fields the public API must not expose.
- **Errors from Server Actions**: throw `ActionError` (`src/lib/actions/errors.ts`) for user-facing messages; `toActionError()` translates known Prisma error codes (P2002 unique conflict, P2025 not found, P2003 FK constraint) into friendly text and logs+masks anything else.
- **Business edit form** (`src/components/businesses/business-form.tsx`) is split into tabs under `src/components/businesses/tabs/` (basic, address, contact, hours, images, description, services, seo, visibility) — when adding a business field, find its tab rather than the top-level form.
- UI is shadcn/Radix (`src/components/ui/`) + Tailwind CSS 4. `src/components/shared/` holds cross-resource pieces (data table, confirm-delete dialog, status badge, empty state).

## Known gaps (don't "fix" without checking with the user first — these are intentional/known, not accidental)

- Business image uploads use local blob URLs — they don't persist to storage yet, despite the schema comment mentioning a Supabase Storage bucket.
- Search (`/api/search`) is plain substring matching, no typo tolerance.
