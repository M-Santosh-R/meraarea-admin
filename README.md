# MeraArea Admin

Internal admin panel and public read API for **MeraArea**, a hyperlocal business directory. Businesses are organized under **Areas** (country → state → city → locality) and **Categories**, with **Services** attached for search/filtering. Every business gets its own page, e.g. `meraarea.in/ahmedabad/vikram-dental-care`.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Prisma 7](https://www.prisma.io) with the `@prisma/adapter-pg` driver adapter, on Postgres (Supabase)
- React 19, Tailwind CSS 4, shadcn/Radix UI components
- Server Actions for admin mutations — no client-side data store

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the database** — set `DATABASE_URL` in `.env` to a Postgres connection string (Supabase: use the **Session pooler** URI from Project Settings → Database, not the direct connection — the direct host is IPv6-only and unreachable from most local networks).

3. **Apply migrations**

   ```bash
   npx prisma migrate deploy   # or `migrate dev` when changing the schema
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

There is no seed script — the database starts empty and is populated entirely through the admin panel.

## Project structure

```
src/app/(admin)/         Admin panel pages (dashboard, areas, categories, services, businesses, admins, profile)
src/app/api/              Public read API (see below)
src/lib/data/              Server-side Prisma read helpers, used by admin Server Components
src/lib/actions/            Server Actions for admin create/update/delete, used by client forms
src/lib/api/public/        Data helpers + serializers backing the public API routes
src/components/            UI components, grouped by resource
prisma/schema.prisma       Database schema
```

The admin panel has **no authentication yet** — every page is reachable and "current admin" is a stand-in resolved by `getCurrentAdmin()` (`src/lib/data/admins.ts`), not a real session.

## Public API

GET-only, unauthenticated, and always filtered to published/active data (a business is hidden if it, its area, or its category is unpublished). Area lookups roll up businesses from descendant areas, so a city page aggregates all of its localities' listings.

| Endpoint | Returns |
|---|---|
| `GET /api/home` | Popular categories, featured areas, featured businesses, recently added businesses |
| `GET /api/areas/[areaSlug]` | Area detail + breadcrumb, categories present, featured businesses, paginated business list |
| `GET /api/areas/[areaSlug]/categories/[categorySlug]` | Businesses filtered by both area and category |
| `GET /api/categories/[categorySlug]` | Category detail + paginated businesses across all areas |
| `GET /api/businesses/[areaSlug]/[businessSlug]` | Full business detail + related businesses |
| `GET /api/search?q=` | Matches business, category, area, and service names |

These endpoints don't yet have a public-facing frontend — only the admin panel UI exists today.

## Known gaps

- No real authentication/authorization on the admin panel
- Business image uploads use local blob URLs — they don't persist to storage yet (no upload/storage wiring exists)
- Search is plain substring matching, no typo tolerance
