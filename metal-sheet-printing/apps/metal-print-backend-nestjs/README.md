# Metal Print Backend (NestJS + Prisma)

Replaces the Medusa v2 backend. Same storefront, same general flow — cart,
custom print upload + DPI check, checkout, order history — rebuilt without
Medusa's multi-region/multi-currency/inventory machinery, since none of
that was needed.

## 1. Install

```bash
npm install
```

## 2. Environment

```bash
cp .env.template .env
```

Fill in every value in `.env`. Notes on the less obvious ones:

- **DATABASE_URL** — use Supabase's **direct connection** string (port 5432),
  not the pooler, for the same reason as the Medusa setup: migrations need
  a session-level connection, not PgBouncer's transaction pooling.
- **JWT_SECRET** — any long random string. Generate one with
  `openssl rand -base64 32` if you don't have a preference.
- **GOOGLE_CLIENT_ID / SECRET** — from
  [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services
  → Credentials → Create Credentials → OAuth Client ID → Application type
  "Web application". Add `http://localhost:9000/auth/google/callback` as an
  authorized redirect URI.
- **FACEBOOK_CLIENT_ID / SECRET** — from
  [Meta for Developers](https://developers.facebook.com/) → your app →
  Facebook Login → Settings. Add
  `http://localhost:9000/auth/facebook/callback` as a valid OAuth redirect URI.

## 3. Database

Your Supabase table should be reset (per your plan) before this runs —
this schema doesn't share any tables with the old Medusa install.

```bash
npx prisma migrate dev --name init
npm run seed
```

`migrate dev` creates every table from `prisma/schema.prisma`. `seed`
recreates the same 8 catalog products the Medusa build had.

## 4. Run

```bash
npm run start:dev
```

Backend listens on `http://localhost:9000` by default (same port your
storefront already expects).

---

## What's different from the Medusa API — frontend changes still needed

I built this backend to be as close as possible to what your existing
`lib/*.ts` files expect, but a few things are **structurally different**
because of decisions made along the way (OAuth-only login, no vehicle
product for custom prints, no regions/currencies) — the storefront's API
client layer will need updating to match. I did not touch the Next.js
project in this pass; this README is the map for that next step.

| Old (Medusa) | New (NestJS) | Why it changed |
|---|---|---|
| `x-publishable-api-key` header on every request | No API key — cart identity comes from an httpOnly `cart_session` cookie, auth from `auth_token` cookie | No sales channels to scope a key to anymore |
| `POST /store/carts` | Not needed — `GET /cart` auto-creates one via the session cookie | Simpler, no explicit create step |
| `POST /store/carts/:id/line-items` | `POST /cart/items` (catalog) or `POST /cart/items/custom` (custom print) — no cart ID in the URL, it's inferred from the cookie | Custom prints are now first-class, not routed through a fake "custom-print" product |
| `addCustomPrintToCart` fetching a `custom-print` product by handle | Gone entirely — `POST /cart/items/custom` takes `customPrintId` directly | No vehicle product needed once carts support custom items natively |
| `POST /store/carts/:id/complete` | `POST /checkout` — **requires being logged in** (401 if not) | You said login is mandatory before placing an order |
| No login anywhere in the old storefront | `GET /auth/google`, `GET /auth/facebook` (redirect flows), `GET /auth/me`, `GET /auth/logout` | New requirement — the storefront needs actual "Sign in with Google/Facebook" buttons before checkout, which didn't exist before |
| Region/shipping-option selection during checkout | Gone — shipping is always free, so there's nothing to select | Matches what you told me |
| `dimensions` + `finish` as free text on the print job | `dimensions` defaults to `"A4"`; no `finish` field at all | Glossy-only, A4-only per your latest requirements |
| Client cropping was optional/not built | **Still needs building** — the configurator page needs an actual crop UI (e.g. a canvas-based drag/zoom within an A4-ratio frame) that produces a single final image blob before upload | This backend assumes the frontend sends an already-cropped image; it doesn't crop anything itself |

The last row is the biggest real gap: **the crop-in-browser UI itself
doesn't exist yet** on the frontend — Module 4's configurator just uploads
whatever file was picked, unmodified. That's a genuine new piece of work,
not a config change.

## Suggested next step

Say the word and I'll update the storefront's `lib/*.ts` files (and the
configurator/checkout pages) to match this API — including the new
crop-before-upload flow and the Google/Facebook sign-in buttons — the same
way the rest of this project has gone, module by module.
